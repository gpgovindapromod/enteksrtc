const fs = require('fs');
const path = require('path');

const rootPath = 'C:\\Users\\HP\\Desktop\\B-tech\\S5\\AWT\\project\\EnteKsrtc';
const artifactPath = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\90f043d8-ac8d-4c07-ba72-8352e5493f07\\detailed_architecture_analysis.md';

const skipDirs = ['node_modules', '.git', 'dist', 'build', '.agents'];

let filesData = {};
let envVars = new Set();
let apiRoutes = [];
let frontendCalls = [];

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (!skipDirs.includes(file)) {
                results = results.concat(walkDir(fullPath));
            }
        } else {
            if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const allFiles = walkDir(rootPath);

// First pass: extract basic info
allFiles.forEach(file => {
    const relPath = path.relative(rootPath, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    
    // Imports
    const importRegex = /import\s+(?:.*?)\s+from\s+['"](.*?)['"]/g;
    const requireRegex = /require\(['"](.*?)['"]\)/g;
    let imports = [];
    let match;
    while ((match = importRegex.exec(content)) !== null) imports.push(match[1]);
    while ((match = requireRegex.exec(content)) !== null) imports.push(match[1]);
    
    // Env vars
    const envRegex = /(?:process\.env\.|import\.meta\.env\.)([A-Z0-9_]+)/g;
    let fileEnvVars = [];
    while ((match = envRegex.exec(content)) !== null) {
        envVars.add(match[1]);
        fileEnvVars.push(match[1]);
    }

    // Backend routes
    if (relPath.startsWith('backend')) {
        const routeRegex = /(?:router|app)\.(get|post|put|delete|patch)\s*\(\s*['"`](.*?)['"`]/g;
        while ((match = routeRegex.exec(content)) !== null) {
            apiRoutes.push({ method: match[1].toUpperCase(), url: match[2], file: relPath });
        }
    }
    
    // Frontend calls
    if (relPath.startsWith('frontend')) {
        const callRegex = /(?:axios\.(get|post|put|delete|patch)|fetch)\s*\(\s*['"`](.*?)['"`]/g;
        while ((match = callRegex.exec(content)) !== null) {
            frontendCalls.push({ method: match[1] ? match[1].toUpperCase() : 'GET', url: match[2], file: relPath });
        }
    }

    filesData[relPath] = {
        path: relPath,
        imports: [...new Set(imports)],
        importedBy: [],
        envVars: [...new Set(fileEnvVars)],
        content: content
    };
});

// Resolve imports to actual files for reverse dependencies
Object.keys(filesData).forEach(filePath => {
    const data = filesData[filePath];
    const dir = path.dirname(filePath);
    
    data.resolvedImports = data.imports.map(imp => {
        if (imp.startsWith('.')) {
            // resolve relative
            let resolved = path.join(dir, imp).replace(/\\/g, '/');
            // Check extensions
            if (filesData[resolved]) return resolved;
            if (filesData[resolved + '.js']) return resolved + '.js';
            if (filesData[resolved + '.jsx']) return resolved + '.jsx';
            if (filesData[resolved + '/index.js']) return resolved + '/index.js';
        }
        return imp; // external or unresolved
    });
    
    data.resolvedImports.forEach(res => {
        if (filesData[res]) {
            filesData[res].importedBy.push(filePath);
        }
    });
});

let md = `# Comprehensive File-Level Architecture Map\n\n`;

md += `## A. Complete file inventory\n`;
md += `| # | Full File Path | Type | Purpose | Imports | Imported By | API Connections | Database Connections |\n`;
md += `|---|---|---|---|---|---|---|---|\n`;
let i = 1;
Object.keys(filesData).forEach(file => {
    const d = filesData[file];
    const type = file.startsWith('backend') ? 'Backend' : 'Frontend';
    const apiConn = (apiRoutes.filter(r => r.file === file).length > 0) || (frontendCalls.filter(c => c.file === file).length > 0) ? 'Yes' : 'No';
    const dbConn = d.content.includes('mongoose.model') || d.imports.some(i => i.includes('mongoose')) ? 'Yes' : 'No';
    md += `| ${i++} | \`${file}\` | ${type} | Source Code | ${d.imports.length} files | ${d.importedBy.length} files | ${apiConn} | ${dbConn} |\n`;
});

md += `\n## B. Complete direct dependency graph\n`;
Object.keys(filesData).forEach(file => {
    if (filesData[file].imports.length > 0) {
        md += `\n\`${file}\`\n`;
        filesData[file].imports.forEach(imp => {
            md += `  ├── imports → \`${imp}\`\n`;
        });
    }
});

md += `\n## C. Reverse dependency graph\n`;
Object.keys(filesData).forEach(file => {
    if (filesData[file].importedBy.length > 0) {
        md += `\n\`${file}\`\n`;
        filesData[file].importedBy.forEach(imp => {
            md += `  ├── imported by → \`${imp}\`\n`;
        });
    }
});

md += `\n## F. API-TO-FILE MAPPING\n`;
apiRoutes.forEach(route => {
    md += `\n\`\`\`text\n`;
    md += `${route.method} ${route.url}\n`;
    md += `        ↓\n`;
    md += `Defined in: ${route.file}\n`;
    const callers = frontendCalls.filter(c => c.url.includes(route.url) || route.url.includes(c.url));
    if (callers.length > 0) {
        md += `        ↓\n`;
        md += `Called by: ${callers.map(c => c.file).join(', ')}\n`;
    }
    md += `\`\`\`\n`;
});

md += `\n## J. ENVIRONMENT VARIABLES\n`;
md += `| Environment Variable | Used By | Defined Where |\n`;
md += `|---|---|---|\n`;
Array.from(envVars).forEach(ev => {
    const users = Object.keys(filesData).filter(f => filesData[f].envVars.includes(ev));
    md += `| ${ev} | ${users.join(', ')} | .env |\n`;
});

md += `\n## K. UNUSED FILES\n`;
md += `*(Files with 0 imports and not an entry point)*\n`;
Object.keys(filesData).forEach(file => {
    const d = filesData[file];
    if (d.importedBy.length === 0 && !file.includes('server.js') && !file.includes('app.js') && !file.includes('main.jsx') && !file.includes('vite.config') && !file.includes('test') && !file.includes('script')) {
        md += `\nFile: \`${file}\`\nReason: No internal files import this file.\nConfidence: Probably unused or dynamically loaded (e.g. route entry).\n`;
    }
});

md += `\n## L. BROKEN CONNECTIONS\n`;
md += `| Problem | File | Expected Connection | Actual Situation | Severity |\n`;
md += `|---|---|---|---|---|\n`;
// Find broken internal imports
Object.keys(filesData).forEach(file => {
    const d = filesData[file];
    d.imports.forEach(imp => {
        if (imp.startsWith('.')) {
            const resolved = d.resolvedImports.find(r => r.includes(imp.replace('./', '').replace('../', '')));
            if (!resolved) {
                md += `| Missing Import | \`${file}\` | \`${imp}\` | File not found | High |\n`;
            }
        }
    });
});

md += `\n## N. COMPLETE MERMAID DIAGRAMS\n`;
md += `### Frontend Map\n\`\`\`mermaid\ngraph TD\n`;
Object.keys(filesData).filter(f => f.startsWith('frontend') && filesData[f].resolvedImports.length > 0).slice(0, 50).forEach(f => {
    const fNode = f.replace(/[^a-zA-Z0-9]/g, '_');
    md += `  ${fNode}["${f}"]\n`;
    filesData[f].resolvedImports.forEach(imp => {
        if (filesData[imp]) {
            const iNode = imp.replace(/[^a-zA-Z0-9]/g, '_');
            md += `  ${fNode} -->|imports| ${iNode}\n`;
        }
    });
});
md += `\`\`\`\n`;

md += `### Backend Map\n\`\`\`mermaid\ngraph TD\n`;
Object.keys(filesData).filter(f => f.startsWith('backend') && filesData[f].resolvedImports.length > 0).slice(0, 50).forEach(f => {
    const fNode = f.replace(/[^a-zA-Z0-9]/g, '_');
    md += `  ${fNode}["${f}"]\n`;
    filesData[f].resolvedImports.forEach(imp => {
        if (filesData[imp]) {
            const iNode = imp.replace(/[^a-zA-Z0-9]/g, '_');
            md += `  ${fNode} -->|imports| ${iNode}\n`;
        }
    });
});
md += `\`\`\`\n`;

fs.writeFileSync(artifactPath, md);
console.log('Detailed analysis generated.');
