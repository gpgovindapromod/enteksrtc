import React from 'react';
import { createRoot } from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PrintableTicket from '../components/shared/PrintableTicket';

export const downloadTicketPDF = async (ticketData, user, filename = 'Ticket.pdf') => {
  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  document.body.appendChild(container);

  // Render the printable ticket
  const root = createRoot(container);

  return new Promise((resolve, reject) => {
    root.render(<PrintableTicket ticket={ticketData} user={user} id="pdf-ticket-capture" />);

    // Give it a moment to render the DOM and load the QR code image
    setTimeout(async () => {
      try {
        const element = document.getElementById('pdf-ticket-capture');
        if (!element) throw new Error('Ticket element not found');

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(filename);
        resolve(true);
      } catch (err) {
        console.error(err);
        reject(err);
      } finally {
        root.unmount();
        document.body.removeChild(container);
      }
    }, 1000); // Wait 1 second for QR image to load
  });
};
