interface SourceWithContent {
  title: string
  link: string
  snippet: string
  content: string
}

interface Report {
  id: string
  title: string
  query: string
  summary: string
  introduction: string
  analysis: string
  methodology?: string
  findings?: string
  discussion?: string
  conclusion: string
  recommendations?: string
  references: string[]
  createdAt: string
  model: string
  language: string
}

export async function generateReportWithGemini(
  query: string,
  sources: SourceWithContent[],
  model: string,
): Promise<Report> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("Gemini API key is not configured")
  }

  // Detect language (simple detection - can be enhanced)
  const language = detectLanguage(query)

  // Prepare the sources content
  const sourcesContent = sources
    .map((source, index) => {
      // Check if content is an error message
      const isErrorContent =
        source.content.startsWith("[Content unavailable") || source.content.startsWith("[Access Forbidden")

      // If we have an error message, include a note about it
      const contentNote = isErrorContent
        ? "\nNote: Full content could not be retrieved. Using available metadata and search snippet."
        : ""

      return `Source ${index + 1}: ${source.title}
URL: ${source.link}${contentNote}
Content: ${source.content.substring(0, 3000)}
---`
    })
    .join("\n\n")

  // Create the prompt for Gemini based on language
  const promptIntro =
    language === "id"
      ? `Anda adalah asisten peneliti profesional. Buatlah laporan penelitian komprehensif dan mendalam berdasarkan sumber-sumber berikut tentang topik: "${query}".`
      : `You are a professional research assistant. Create a comprehensive and in-depth research report based on the following sources about the topic: "${query}".`

  const promptNote =
    language === "id"
      ? "Beberapa sumber mungkin memiliki konten terbatas karena pembatasan akses. Dalam kasus seperti itu, gunakan metadata dan cuplikan pencarian yang tersedia untuk menginformasikan analisis Anda."
      : "Some sources may have limited content due to access restrictions. In such cases, use the available metadata and search snippets to inform your analysis."

  const promptStructure =
    language === "id"
      ? `Hasilkan laporan penelitian terperinci dengan struktur berikut:
1. Judul: Buat judul deskriptif untuk laporan.
2. Ringkasan Eksekutif: Gambaran singkat tentang temuan utama (2-3 paragraf).
3. Pendahuluan: Perkenalkan topik dan signifikansinya.
4. Metodologi: Jelaskan pendekatan yang digunakan dalam penelitian ini.
5. Temuan: Sajikan temuan utama dari sumber-sumber yang dianalisis.
6. Analisis: Berikan analisis mendalam tentang topik berdasarkan sumber.
7. Diskusi: Bahas implikasi dari temuan dan analisis.
8. Kesimpulan: Rangkum poin-poin utama dan berikan wawasan.
9. Rekomendasi: Berikan saran untuk tindakan atau penelitian lebih lanjut.
10. Referensi: Daftar semua sumber yang digunakan dalam laporan.`
      : `Generate a detailed research report with the following structure:
1. Title: Create a descriptive title for the report.
2. Executive Summary: A brief overview of the key findings (2-3 paragraphs).
3. Introduction: Introduce the topic and its significance.
4. Methodology: Explain the approach used in this research.
5. Findings: Present the main findings from the analyzed sources.
6. Analysis: Provide an in-depth analysis of the topic based on the sources.
7. Discussion: Discuss the implications of the findings and analysis.
8. Conclusion: Summarize the key points and provide insights.
9. Recommendations: Provide suggestions for action or further research.
10. References: List all the sources used in the report.`

  const promptFormat =
    language === "id"
      ? `Format respons sebagai objek JSON dengan struktur berikut:
{
  "title": "Judul Laporan",
  "summary": "Teks ringkasan eksekutif...",
  "introduction": "Teks pendahuluan...",
  "methodology": "Teks metodologi...",
  "findings": "Teks temuan...",
  "analysis": "Teks analisis...",
  "discussion": "Teks diskusi...",
  "conclusion": "Teks kesimpulan...",
  "recommendations": "Teks rekomendasi...",
  "references": ["Referensi 1", "Referensi 2", ...]
}`
      : `Format the response as a JSON object with the following structure:
{
  "title": "Report Title",
  "summary": "Executive summary text...",
  "introduction": "Introduction text...",
  "methodology": "Methodology text...",
  "findings": "Findings text...",
  "analysis": "Analysis text...",
  "discussion": "Discussion text...",
  "conclusion": "Conclusion text...",
  "recommendations": "Recommendations text...",
  "references": ["Reference 1", "Reference 2", ...]
}`

  const promptFinal =
    language === "id"
      ? "Pastikan laporan terstruktur dengan baik, informatif, dan berdasarkan sumber-sumber yang disediakan. Berikan analisis yang mendalam dan komprehensif dengan detail yang kaya dan wawasan yang bermakna."
      : "Make sure the report is well-structured, informative, and based solely on the provided sources. Provide deep and comprehensive analysis with rich details and meaningful insights."

  const prompt = `
${promptIntro}

${sourcesContent}

${promptNote}

${promptStructure}

${promptFormat}

${promptFinal}
`

  try {
    // Call Gemini API with updated parameters
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 65536,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || "Gemini API request failed")
    }

    const data = await response.json()

    // Extract the generated text
    const generatedText = data.candidates[0].content.parts[0].text

    // Extract the JSON object from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from Gemini response")
    }

    const reportData = JSON.parse(jsonMatch[0])

    // Create the report object
    const report: Report = {
      id: generateId(),
      title: reportData.title,
      query,
      summary: reportData.summary,
      introduction: reportData.introduction,
      methodology: reportData.methodology,
      findings: reportData.findings,
      analysis: reportData.analysis,
      discussion: reportData.discussion,
      conclusion: reportData.conclusion,
      recommendations: reportData.recommendations,
      references: reportData.references,
      createdAt: new Date().toISOString(),
      model,
      language,
    }

    return report
  } catch (error) {
    console.error("Gemini API error:", error)
    throw error
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function detectLanguage(text: string): string {
  // Simple language detection - can be enhanced with a proper library
  const indonesianWords = [
    "dan",
    "atau",
    "dengan",
    "untuk",
    "dari",
    "pada",
    "yang",
    "di",
    "dalam",
    "ini",
    "itu",
    "oleh",
    "pada",
    "ke",
    "tentang",
  ]

  const words = text.toLowerCase().split(/\s+/)
  let indonesianCount = 0

  for (const word of words) {
    if (indonesianWords.includes(word)) {
      indonesianCount++
    }
  }

  // If more than 10% of words are Indonesian, consider it Indonesian
  return indonesianCount / words.length > 0.1 ? "id" : "en"
}
