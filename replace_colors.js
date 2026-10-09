const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'frontend', 'src');

function replaceInFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInFiles(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // Replace literal hex codes with deep green #1a7a40
            content = content.replace(/#10b981/g, '#1a7a40');
            // Wait, we also want to replace the bright orange/red for search button.
            // Let's first just replace the green.
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated:', fullPath);
            }
        }
    }
}

replaceInFiles(directory);
console.log('Replacement complete.');
