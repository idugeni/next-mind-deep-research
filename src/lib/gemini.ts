import { Report } from "@/types/report"
import indonesianWords from "./lang/indonesian-words";

interface SourceWithContent {
  title: string
  link: string
  snippet: string
  content: string
}

// Helper: Prompt Engineering Deep Research (selalu digunakan)
function getDeepResearchPrompt(query: string, sourcesContent: string, language: string) {
  if (language === "id") {
    return `Anda adalah asisten riset ilmiah DEEP RESEARCH yang sangat teliti dan mendalam. Buat laporan penelitian dengan analisis kritis, sintesis lintas sumber, dan ulasan literatur yang komprehensif.\n\nStruktur laporan:\n1. Pendahuluan: Konteks, latar belakang, dan urgensi topik.\n2. Ringkasan Eksekutif: Temuan utama secara padat.\n3. Tinjauan Literatur: Sintesis dan perbandingan hasil penelitian atau teori dari berbagai sumber utama.\n4. Metodologi: Detail metode pencarian, seleksi sumber, pendekatan analisis, serta kelebihan dan kekurangannya.\n5. Temuan Utama: Data, fakta, insight mendalam dari sumber.\n6. Analisis Mendalam: Analisa kritis, perbandingan, highlight gap penelitian, pro-kontra, dan insight penting.\n7. Critical Appraisal: Evaluasi kualitas, bias, keterbatasan, dan validitas data/sumber/metode.\n8. Diskusi: Implikasi, relevansi, dan keterbatasan temuan.\n9. Kesimpulan: Benang merah dari seluruh analisis.\n10. Rekomendasi & Future Work: Saran penelitian lanjutan atau aplikasi praktis.\n11. Referensi: Daftar sumber ilmiah (jurnal, buku, dsb) dengan URL atau DOI.\n\nPetunjuk tambahan:\n- Bandingkan teori/temuan antar sumber.\n- Sertakan kutipan langsung jika relevan.\n- Sajikan tabel/diagram jika relevan (format teks).\n- Setiap klaim HARUS didukung referensi primer.\n- Gunakan bahasa akademik, sistematis, dan komprehensif.\n\nPENTING: Format respons HANYA sebagai objek JSON valid. JANGAN tambahkan narasi di luar JSON.\n\nTopik riset: ${query}\n\nSumber yang dapat digunakan:\n${sourcesContent}\n\nFormat JSON:\n{\n  "title": "Judul Laporan",\n  "summary": "Ringkasan eksekutif...",\n  "introduction": "Pendahuluan...",\n  "literature_review": "Tinjauan literatur...",\n  "methodology": "Metodologi...",\n  "findings": "Temuan utama...",\n  "analysis": "Analisis mendalam...",\n  "critical_appraisal": "Evaluasi kritis sumber/metode...",\n  "discussion": "Diskusi...",\n  "conclusion": "Kesimpulan...",\n  "recommendations": "Rekomendasi dan future work...",\n  "references": ["Referensi 1", "Referensi 2", ...]\n}`;
  } else {
    return `You are a DEEP RESEARCH scientific assistant. Generate a research report with critical analysis, cross-source synthesis, and comprehensive literature review.\n\nReport structure:\n1. Introduction: Context, background, and topic urgency.\n2. Executive Summary: Concise main findings.\n3. Literature Review: Synthesis and comparison of research findings or theories from key sources.\n4. Methodology: Detailed search method, source selection, analytical approach, strengths and weaknesses.\n5. Key Findings: Data, facts, deep insights from sources.\n6. In-depth Analysis: Critical analysis, comparison, research gap highlights, pros-cons, key insights.\n7. Critical Appraisal: Evaluation of quality, bias, limitations, and validity of data/sources/methods.\n8. Discussion: Implications, relevance, and limitations of findings.\n9. Conclusion: Synthesis of all analysis.\n10. Recommendations & Future Work: Suggestions for further research or practical applications.\n11. References: List of scientific sources (journals, books, etc.) with URL or DOI.\n\nAdditional instructions:\n- Compare theories/findings across sources.\n- Include direct quotes if relevant.\n- Present tables/diagrams if relevant (text format).\n- Every claim MUST be supported by a primary reference.\n- Use academic, systematic, and comprehensive language.\n\nIMPORTANT: Format the response ONLY as a valid JSON object. DO NOT add any narration outside the JSON.\n\nResearch topic: ${query}\n\nSources available:\n${sourcesContent}\n\nJSON format:\n{\n  "title": "Report Title",\n  "summary": "Executive summary...",\n  "introduction": "Introduction...",\n  "literature_review": "Literature review...",\n  "methodology": "Methodology...",\n  "findings": "Key findings...",\n  "analysis": "In-depth analysis...",\n  "critical_appraisal": "Critical appraisal of sources/methods...",\n  "discussion": "Discussion...",\n  "conclusion": "Conclusion...",\n  "recommendations": "Recommendations and future work...",\n  "references": ["Reference 1", "Reference 2", ...]\n}`;
  }
}

export async function generateReportWithGemini(
  query: string,
  sources: SourceWithContent[],
  model: string,
  language?: string
): Promise<Report> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("Gemini API key is not configured")
  }

  // Use provided language or detect from query
  const reportLanguage = language || detectLanguage(query)
  const finalLanguage: string = reportLanguage

  const sourcesContent = sources
    .map((source, index) => {
      return `Sumber ${index + 1}: ${source.title} (URL: ${source.link})`
    })
    .join("\n")

  // Selalu gunakan prompt deep research
  const prompt = getDeepResearchPrompt(query, sourcesContent, finalLanguage)

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
            temperature: 1,
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
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    // --- Perbaikan: Tampilkan isi mentah jika gagal parsing ---
    let jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Coba ekstrak JSON tanpa trailing koma
      const cleaned = generatedText.replace(/,\s*\}/g, "}").replace(/,\s*\]/g, "]")
      jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error("Gemini raw response:", generatedText)
        throw new Error("Failed to extract JSON from Gemini response.\nRaw Gemini output: " + generatedText)
      }
    }

    let reportDataRaw
    try {
      reportDataRaw = JSON.parse(jsonMatch[0])
    } catch {
      // Coba parse dengan JSON5 jika error (opsional, jika JSON5 tersedia)
      try {
        const json5 = await import("json5");
        reportDataRaw = json5.parse(jsonMatch[0])
      } catch {
        console.error("Gemini JSON parse error:\nRaw:", jsonMatch[0])
        throw new Error("Failed to parse Gemini JSON.\nRaw JSON: " + jsonMatch[0])
      }
    }
    // Normalisasi: jika hasil Gemini membungkus dengan property "report", ambil isinya
    const reportData = (reportDataRaw && typeof reportDataRaw === "object" && "report" in reportDataRaw)
      ? reportDataRaw.report
      : reportDataRaw

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
      language: finalLanguage,
      literature_review: reportData.literature_review,
      critical_appraisal: reportData.critical_appraisal,
    }

    return report
  } catch {
    console.error("Gemini API error:")
    throw new Error("Gemini API request failed")
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function detectLanguage(text: string): string {
  // Simple language detection - can be enhanced with a proper library
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
