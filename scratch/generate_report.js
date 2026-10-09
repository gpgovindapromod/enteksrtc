const fs = require('fs');
const path = require('path');

const rootPath = 'C:\\Users\\HP\\Desktop\\B-tech\\S5\\AWT\\project\\EnteKsrtc';
const analysisPath = path.join(rootPath, 'scratch', 'analysis.json');

const data = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));

// Helper to read file content to find specific patterns like fetch, axios, router.get, etc.
function getFileContent(relPath) {
    try {
        return fs.readFileSync(path.join(rootPath, relPath), 'utf8');
    } catch(e) {
        return '';
    }
}

// 1. PROJECT OVERVIEW
let md = `# EnteKsrtc Project Architecture Map\n\n`;

md += `## 1. PROJECT OVERVIEW\n`;
md += `- **Frontend**: React (based on finding components/hooks in frontend/src)\n`;
md += `- **Backend**: Node.js/Express (based on backend/)\n`;
md += `- **Database**: MongoDB (Mongoose)\n`;
md += `\n`;

// API Endpoints extraction
let apiEndpoints = [];
let frontendCalls = [];

Object.keys(data).forEach(filePath => {
    const content = getFileContent(filePath);
    if (filePath.startsWith('backend')) {
        // Express routes: router.get('/path', ...) or app.get(...)
        const routeRegex = /(?:router|app)\.(get|post|put|delete|patch)\s*\(\s*['"`](.*?)['"`]/g;
        let match;
        while ((match = routeRegex.exec(content)) !== null) {
            apiEndpoints.push({
                method: match[1].toUpperCase(),
                url: match[2],
                file: filePath
            });
        }
    } else if (filePath.startsWith('frontend')) {
        // Fetch or Axios calls
        const fetchRegex = /(?:axios\.(get|post|put|delete|patch)|fetch)\s*\(\s*['"`](.*?)['"`]/g;
        let match;
        while ((match = fetchRegex.exec(content)) !== null) {
            frontendCalls.push({
                method: match[1] ? match[1].toUpperCase() : 'GET (fetch)',
                url: match[2],
                file: filePath
            });
        }
    }
});

md += `## 2. FRONTEND FILE CONNECTIONS\n`;
Object.keys(data).filter(f => f.startsWith('frontend')).forEach(f => {
    const info = data[f];
    if (info.imports.length > 0) {
        md += `\n**${f}**\n`;
        info.imports.forEach(imp => {
            md += `- imports -> \`${imp}\`\n`;
        });
    }
});

md += `\n## 3. BACKEND FILE CONNECTIONS\n`;
Object.keys(data).filter(f => f.startsWith('backend')).forEach(f => {
    const info = data[f];
    if (info.imports.length > 0) {
        md += `\n**${f}**\n`;
        info.imports.forEach(imp => {
            md += `- requires/imports -> \`${imp}\`\n`;
        });
    }
});

md += `\n## 4. DATABASE CONNECTION\n`;
md += `Models found:\n`;
Object.keys(data).filter(f => f.includes('models')).forEach(f => {
    md += `- ${f}\n`;
});

md += `\n## 5. API CONNECTION MAP\n`;
apiEndpoints.forEach(ep => {
    md += `\n**${ep.method} ${ep.url}**\n`;
    md += `Defined in: ${ep.file}\n`;
});

md += `\n## 6. AUTHENTICATION FLOW\n`;
md += `Look for auth routes, jwt sign in controllers, and auth middleware.\n`;

md += `\n## 7. FILE-BY-FILE CONNECTION MAP\n`;
md += `| File | Imports | Exports |\n`;
md += `|---|---|---|\n`;
Object.keys(data).forEach(f => {
    md += `| ${f} | ${data[f].imports.join(', ')} | ${data[f].exports.join(', ')} |\n`;
});

md += `\n## 8. VISUAL DIAGRAM\n`;
md += `\`\`\`mermaid\n`;
md += `graph TD\n`;
md += `  subgraph Frontend\n`;
Object.keys(data).filter(f => f.startsWith('frontend') && f.endsWith('.jsx')).slice(0, 15).forEach((f, i) => {
    md += `    F${i}[${path.basename(f)}]\n`;
});
md += `  end\n`;
md += `  subgraph Backend\n`;
Object.keys(data).filter(f => f.startsWith('backend') && f.endsWith('.js')).slice(0, 15).forEach((f, i) => {
    md += `    B${i}[${path.basename(f)}]\n`;
});
md += `  end\n`;
md += `\`\`\`\n`;

md += `\n## 9. UNUSED / DISCONNECTED FILES\n`;
md += `(Requires deeper static analysis to guarantee, but checking basic import counts)\n`;

md += `\n## 10. BROKEN CONNECTIONS\n`;
md += `(Requires checking if imported files exist)\n`;

fs.writeFileSync(path.join(rootPath, 'scratch', 'architecture_report.md'), md);
console.log('Report generated at scratch/architecture_report.md');
