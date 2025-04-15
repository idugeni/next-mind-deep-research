import { jsPDF } from "jspdf"
import { Report } from "../types/report";

export async function generatePdf(report: Report) {
  const language: string = report.language ?? "en"

  const labels = {
    executiveSummary: language === "id" ? "Ringkasan Eksekutif" : "Executive Summary",
    introduction: language === "id" ? "Pendahuluan" : "Introduction",
    methodology: language === "id" ? "Metodologi" : "Methodology",
    findings: language === "id" ? "Temuan" : "Findings",
    analysis: language === "id" ? "Analisis" : "Analysis",
    discussion: language === "id" ? "Diskusi" : "Discussion",
    conclusion: language === "id" ? "Kesimpulan" : "Conclusion",
    recommendations: language === "id" ? "Rekomendasi" : "Recommendations",
    references: language === "id" ? "Referensi" : "References",
  }

  const doc = new jsPDF()
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginTop = 20;
  const marginBottom = 20;
  const marginLeft = 20;
  const marginRight = 20;
  let y: number = marginTop;

  function checkPageBreak(extraSpace = 0) {
    if (y + extraSpace > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
      // (Opsional) Tambahkan judul di setiap halaman:
      // doc.setFontSize(12); doc.text(report.title ?? "", marginLeft, y); y += 10;
    }
  }

  function addSectionTitle(title: string | undefined) {
    const safeTitle = typeof title === "string" ? title : String(title ?? "");
    if (!safeTitle) return;
    checkPageBreak(14);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(safeTitle, marginLeft, y);
    y += 10;
  }

  function addSectionText(text: string | undefined) {
    const safeText = typeof text === "string" ? text : String(text ?? "");
    if (!safeText) return;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const textLines = doc.splitTextToSize(safeText, doc.internal.pageSize.getWidth() - marginLeft - marginRight);
    textLines.forEach((line: string) => {
      checkPageBreak(7);
      doc.text(String(line ?? ""), marginLeft, y);
      y += 7;
    });
    y += 5; // Add some space after the section
  }

  // Judul utama
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  // Wrap judul utama agar tidak keluar batas
  const titleLines = doc.splitTextToSize(String(report.title ?? ""), doc.internal.pageSize.getWidth() - marginLeft - marginRight);
  titleLines.forEach((line: string) => {
    checkPageBreak(10);
    doc.text(line, marginLeft, y);
    y += 10;
  });
  y += 5;

  // Section eksekutif
  addSectionTitle(labels.executiveSummary ?? "");
  addSectionText(report.summary ?? "");

  addSectionTitle(labels.introduction ?? "");
  addSectionText(report.introduction ?? "");

  if (report.methodology) {
    addSectionTitle(labels.methodology ?? "");
    addSectionText(report.methodology ?? "");
  }

  if (report.findings) {
    addSectionTitle(labels.findings ?? "");
    addSectionText(report.findings ?? "");
  }

  addSectionTitle(labels.analysis ?? "");
  addSectionText(report.analysis ?? "");

  if (report.discussion) {
    addSectionTitle(labels.discussion ?? "");
    addSectionText(report.discussion ?? "");
  }

  addSectionTitle(labels.conclusion ?? "");
  addSectionText(report.conclusion ?? "");

  if (report.recommendations) {
    addSectionTitle(labels.recommendations ?? "");
    addSectionText(report.recommendations ?? "");
  }

  addSectionTitle(labels.references ?? "");
  if (report.references && report.references.length > 0) {
    report.references.forEach((reference: string, index: number) => {
      checkPageBreak(7);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      // Wrap referensi agar tidak keluar batas
      const refLines = doc.splitTextToSize(String(`${index + 1}. ${reference ?? ""}`), doc.internal.pageSize.getWidth() - marginLeft - marginRight - 5);
      refLines.forEach((line: string) => {
        checkPageBreak(7);
        doc.text(line, marginLeft + 5, y);
        y += 7;
      });
      y += 2;
    });
    y += 3;
  } else {
    addSectionText("-");
  }

  const pdfBlob = doc.output("blob");
  return pdfBlob;
}
