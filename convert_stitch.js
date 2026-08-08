const fs = require('fs');

let html = fs.readFileSync('C:\\Users\\HP\\Downloads\\stitch_ente_ksrtc_premium_landing_page\\code.html', 'utf8');

// Extract body content
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) {
  console.error("No body found");
  process.exit(1);
}

let bodyContent = bodyMatch[1];

// Remove script tags
bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, '');

// Replace class= with className=
bodyContent = bodyContent.replace(/class=/g, 'className=');

// Close unclosed input tags
bodyContent = bodyContent.replace(/<input([^>]*?[^\/])>/gi, '<input$1/>');

// Convert HTML comments to React comments
bodyContent = bodyContent.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

// Write out to a temporary file
fs.writeFileSync('temp_jsx.txt', bodyContent);
console.log('JSX structure saved to temp_jsx.txt');
