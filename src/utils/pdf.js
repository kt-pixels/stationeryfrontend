import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDF = (title, columns, rows, options = {}) => {
  const doc = new jsPDF();

  const {
    header = [],
    footer = "Thank you for your business!",
    totalLabel = "Total",
    totalAmount = null,
  } = options;

  let y = 15;

  // ================= COMPANY HEADER =================
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("My Shop / Business Name", 14, y);

  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Address • Phone • GSTIN", 14, y);

  y += 10;

  // ================= TITLE =================
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), 14, y);

  y += 8;

  // ================= META =================
  doc.setFontSize(10);
  header.forEach((line) => {
    doc.text(line, 14, y);
    y += 5;
  });

  y += 3;

  // ================= TABLE =================
  autoTable(doc, {
    startY: y,
    head: [columns],
    body: rows,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [63, 81, 181],
      textColor: 255,
    },
  });

  let finalY = doc.lastAutoTable.finalY + 6;

  // ================= TOTAL =================
  if (totalAmount !== null) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalLabel}: ₹${totalAmount}`, 140, finalY);
    finalY += 8;
  }

  // ================= FOOTER =================
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(footer, 14, finalY + 10);

  doc.save(`${title}.pdf`);
};
