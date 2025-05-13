
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (elementId: string, fileName: string = 'report.pdf'): Promise<Blob> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID ${elementId} not found`);
  }
  
  // Create canvas from the element
  const canvas = await html2canvas(element, {
    scale: 2, // Higher scale for better quality
    useCORS: true,
    logging: false,
  });
  
  const imgData = canvas.toDataURL('image/png');
  
  // Calculate dimensions
  const imgWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  // Create PDF document
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  let heightLeft = imgHeight;
  let position = 0;
  
  // Add image to first page
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  
  // Add new pages if needed for long content
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  // Save the PDF
  return pdf.output('blob');
};

export const downloadPDF = async (elementId: string, fileName: string = 'report.pdf'): Promise<void> => {
  try {
    const pdfBlob = await generatePDF(elementId, fileName);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const sharePDF = async (elementId: string, fileName: string = 'report.pdf'): Promise<void> => {
  try {
    const pdfBlob = await generatePDF(elementId, fileName);
    
    // Check if Web Share API is supported
    if (navigator.share) {
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      await navigator.share({
        title: 'Trader Profit Report',
        text: 'Here is your daily profit report',
        files: [file]
      });
    } else {
      // Fallback if Web Share API is not supported
      const link = document.createElement('a');
      link.href = URL.createObjectURL(pdfBlob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  } catch (error) {
    console.error('Error sharing PDF:', error);
    throw error;
  }
};
