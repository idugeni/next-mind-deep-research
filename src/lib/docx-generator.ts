import { Document, Packer, Paragraph, HeadingLevel } from "docx"

export async function generateDocx(report) {
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

  // Create sections for the document
  const sections = []

  // Title
  sections.push(
    new Paragraph({
      text: report.title,
      heading: HeadingLevel.TITLE,
    }),
  )

  // Executive Summary
  sections.push(
    new Paragraph({
      text: labels.executiveSummary,
      heading: HeadingLevel.HEADING_1,
    }),
  )
  sections.push(new Paragraph({ text: report.summary }))

  // Introduction
  sections.push(
    new Paragraph({
      text: labels.introduction,
      heading: HeadingLevel.HEADING_1,
    }),
  )
  sections.push(new Paragraph({ text: report.introduction }))

  // Methodology (if exists)
  if (report.methodology) {
    sections.push(
      new Paragraph({
        text: labels.methodology,
        heading: HeadingLevel.HEADING_1,
      }),
    )
    sections.push(new Paragraph({ text: report.methodology }))
  }

  // Findings (if exists)
  if (report.findings) {
    sections.push(
      new Paragraph({
        text: labels.findings,
        heading: HeadingLevel.HEADING_1,
      }),
    )
    sections.push(new Paragraph({ text: report.findings }))
  }

  // Analysis
  sections.push(
    new Paragraph({
      text: labels.analysis,
      heading: HeadingLevel.HEADING_1,
    }),
  )
  sections.push(new Paragraph({ text: report.analysis }))

  // Discussion (if exists)
  if (report.discussion) {
    sections.push(
      new Paragraph({
        text: labels.discussion,
        heading: HeadingLevel.HEADING_1,
      }),
    )
    sections.push(new Paragraph({ text: report.discussion }))
  }

  // Conclusion
  sections.push(
    new Paragraph({
      text: labels.conclusion,
      heading: HeadingLevel.HEADING_1,
    }),
  )
  sections.push(new Paragraph({ text: report.conclusion }))

  // Recommendations (if exists)
  if (report.recommendations) {
    sections.push(
      new Paragraph({
        text: labels.recommendations,
        heading: HeadingLevel.HEADING_1,
      }),
    )
    sections.push(new Paragraph({ text: report.recommendations }))
  }

  // References
  sections.push(
    new Paragraph({
      text: labels.references,
      heading: HeadingLevel.HEADING_1,
    }),
  )

  report.references.forEach((reference, index) => {
    sections.push(
      new Paragraph({
        text: `${index + 1}. ${reference}`,
      }),
    )
  })

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  })

  // Generate blob
  return await Packer.toBlob(doc)
}
