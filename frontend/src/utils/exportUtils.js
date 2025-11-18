import jsPDF from 'jspdf';

export const exportToText = (content, filename) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = (title, content, filename) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxLineWidth = pageWidth - 2 * margin;
  
  // Add title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, margin);
  
  // Add content
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const lines = doc.splitTextToSize(content, maxLineWidth);
  let yPosition = margin + 15;
  
  lines.forEach((line, index) => {
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(line, margin, yPosition);
    yPosition += 7;
  });
  
  doc.save(filename);
};


