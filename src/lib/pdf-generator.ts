import { jsPDF } from "jspdf"

export async function generatePdf(report) {
  const language = report.language || "en"

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

  let y = 20

  function addSectionTitle(title) {
    doc.setFontSize(16)
    doc.text(title, 20, y)
    y += 10
  }

  function addSectionText(text) {
    doc.setFontSize(12)
    const textLines = doc.splitTextToSize(text, doc.internal.pageSize.getWidth() - 40)
    textLines.forEach((line) => {
      doc.text(line, 20, y)
      y += 5
    })
    y += 5 // Add some space after the section
  }

  doc.setFontSize(20)
  doc.text(report.title, 20, y)
  y += 20

  addSectionTitle(labels.executiveSummary)
  addSectionText(report.summary)

  addSectionTitle(labels.introduction)
  addSectionText(report.introduction)

  if (report.methodology) {
    addSectionTitle(labels.methodology)
    addSectionText(report.methodology)
  }

  if (report.findings) {
    addSectionTitle(labels.findings)
    addSectionText(report.findings)
  }

  addSectionTitle(labels.analysis)
  addSectionText(report.analysis)

  if (report.discussion) {
    addSectionTitle(labels.discussion)
    addSectionText(report.discussion)
  }

  addSectionTitle(labels.conclusion)
  addSectionText(report.conclusion)

  if (report.recommendations) {
    addSectionTitle(labels.recommendations)
    addSectionText(report.recommendations)
  }

  addSectionTitle(labels.references)
  report.references.forEach((reference, index) => {
    addSectionText(`${index + 1}. ${reference}`)
  })

  const pdfBlob = doc.output("blob")
  return pdfBlob
}
