const fs = require('fs');

function addPDFButton(filePath, ticketId, buttonClass, navCode) {
  let c = fs.readFileSync(filePath, 'utf8');

  // Add id to ticket summary div
  c = c.replace(
    /(<div className="max-w-md mx-auto mb-8 p-6 bg-gray-50)/,
    `<div id="${ticketId}" className="max-w-md mx-auto mb-8 p-6 bg-gray-50`
  );

  // Also try without space before mb (mobile version)
  c = c.replace(
    /(<div className="bg-gray-50 dark:bg-slate-950 rounded-xl p-5 text-left border)/,
    `<div id="${ticketId}" className="bg-gray-50 dark:bg-slate-950 rounded-xl p-5 text-left border`
  );

  // Add Download PDF button
  c = c.replace(navCode, navCode.replace('</button>', `</button>\n                    <button\n                      onClick={() => window.__downloadTicketPDF && window.__downloadTicketPDF('${ticketId}', 'KSRTC-Ticket.pdf')}\n                      className="${buttonClass}"\n                    >\n                      Download PDF\n                    </button>`));

  fs.writeFileSync(filePath, c);
}
