import { Report } from "@/types/report"
import indonesianWords from "./lang/indonesian-words";

// Tambahkan config untuk membaca env
const useBackendApiKey = process.env.USE_BACKEND_API_KEY === "true";

interface SourceWithContent {
  title: string
  link: string
  snippet: string
  content: string
}

// Helper: Prompt Engineering Deep Research (selalu digunakan)
function getDeepResearchPrompt(query: string, sourcesContent: string, language: string) {
  // Skala prioritas section (best practice, konsisten backend/frontend/AI)
  const sectionOrder = [
    "introduction",
    "summary",
    "literature_review",
    "methodology",
    "findings",
    "analysis",
    "critical_appraisal",
    "discussion",
    "conclusion",
    "recommendations",
    "references"
  ];
  if (language === "id") {
    return `Anda adalah asisten riset ilmiah DEEP RESEARCH yang sangat teliti dan mendalam. Buat laporan penelitian dengan analisis kritis, sintesis lintas sumber, dan ulasan literatur yang komprehensif.\n\nStruktur laporan (urutkan dan isi semua jika memungkinkan):\n${sectionOrder.map((s, i) => `${i+1}. ${getSectionLabel(s, 'id')}`).join('\\n')}\n\nPetunjuk tambahan:\n- Bandingkan teori/temuan antar sumber.\n- Sertakan kutipan langsung jika relevan.\n- Sajikan tabel/diagram jika relevan (format teks).\n- Setiap klaim HARUS didukung referensi primer.\n- Gunakan bahasa akademik, sistematis, dan komprehensif.\n\nPENTING: Format respons HANYA sebagai objek JSON valid. JANGAN tambahkan narasi di luar JSON.\n\nTopik riset: ${query}\n\nSumber yang dapat digunakan:\n${sourcesContent}\n\nFormat JSON:\n{\n  "title": "Judul Laporan",\n${sectionOrder.map(s => `  "${s}": "...",`).join('\n')}\n  "references": ["Referensi 1", "Referensi 2", ...]\n}`;
  } else {
    return `You are a DEEP RESEARCH scientific assistant. Generate a research report with critical analysis, cross-source synthesis, and comprehensive literature review.\n\nReport structure (order and fill all if possible):\n${sectionOrder.map((s, i) => `${i+1}. ${getSectionLabel(s, 'en')}`).join('\\n')}\n\nAdditional instructions:\n- Compare theories/findings across sources.\n- Include direct quotes if relevant.\n- Present tables/diagrams if relevant (text format).\n- Every claim MUST be supported by a primary reference.\n- Use academic, systematic, and comprehensive language.\n\nIMPORTANT: Format the response ONLY as a valid JSON object. DO NOT add any narration outside the JSON.\n\nResearch topic: ${query}\n\nSources available:\n${sourcesContent}\n\nJSON format:\n{\n  "title": "Report Title",\n${sectionOrder.map(s => `  "${s}": "...",`).join('\n')}\n  "references": ["Reference 1", "Reference 2", ...]\n}`;
  }
}

function getSectionLabel(key: string, lang: 'id'|'en'): string {
  const labels: Record<string, {id: string, en: string}> = {
    introduction: { id: "Pendahuluan", en: "Introduction" },
    summary: { id: "Ringkasan Eksekutif", en: "Executive Summary" },
    literature_review: { id: "Tinjauan Literatur", en: "Literature Review" },
    methodology: { id: "Metodologi", en: "Methodology" },
    findings: { id: "Temuan Utama", en: "Key Findings" },
    analysis: { id: "Analisis Mendalam", en: "In-depth Analysis" },
    critical_appraisal: { id: "Kritik Kritis", en: "Critical Appraisal" },
    discussion: { id: "Diskusi", en: "Discussion" },
    conclusion: { id: "Kesimpulan", en: "Conclusion" },
    recommendations: { id: "Rekomendasi & Future Work", en: "Recommendations & Future Work" },
    references: { id: "Referensi", en: "References" }
  };
  return labels[key]?.[lang] || key;
}

export async function generateReportWithGemini(
  query: string,
  sources: SourceWithContent[],
  model: string,
  language?: string,
  apiKeyFromInput?: string // Tambahkan opsional API key dari frontend
): Promise<Report> {
  // Pilih sumber API key sesuai opsi
  let apiKey: string | undefined;
  if (useBackendApiKey) {
    apiKey = process.env.GEMINI_API_KEY;
  } else {
    apiKey = apiKeyFromInput;
  }

  if (!apiKey) {
    throw new Error("Gemini API key is not configured")
  }

  // Use provided language or detect from query
  const reportLanguage = language || detectLanguage(query)
  const finalLanguage: string = reportLanguage

  const sourcesContent = sources
    .map((source, index) => {
      // Format: Sumber 1: Judul Lengkap (Link)
      return `Sumber ${index + 1}: ${source.title} (${source.link})`;
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
        // Error handled by caller/frontend
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
        // Error handled by caller/frontend
        throw new Error("Failed to parse Gemini JSON.\nRaw JSON: " + jsonMatch[0])
      }
    }
    // Normalisasi: jika hasil Gemini membungkus dengan property "report", ambil isinya
    const reportData = (reportDataRaw && typeof reportDataRaw === "object" && "report" in reportDataRaw)
      ? reportDataRaw.report
      : reportDataRaw

    // references: pastikan format: Sumber 1: Judul Lengkap (Link)
    const references = Array.isArray(reportData.references)
      ? reportData.references.map((ref: { title?: string; link?: string } | string, idx: number) => {
          // Jika sudah string "Judul (url)", tetap, jika object, formatkan
          if (typeof ref === 'string') return `Sumber ${idx + 1}: ${ref}`;
          if (ref && typeof ref === 'object' && typeof ref.title === 'string' && typeof ref.link === 'string') {
            return `Sumber ${idx + 1}: ${ref.title} (${ref.link})`;
          }
          return `Sumber ${idx + 1}: ${String(ref)}`;
        })
      : [];

    // Create the report object
    const report: Report = {
      id: generateId(),
      title: reportData.title,
      query,
      introduction: reportData.introduction,
      summary: reportData.summary,
      literature_review: reportData.literature_review,
      methodology: reportData.methodology,
      findings: reportData.findings,
      analysis: reportData.analysis,
      critical_appraisal: reportData.critical_appraisal,
      discussion: reportData.discussion,
      conclusion: reportData.conclusion,
      recommendations: reportData.recommendations,
      references: references,
      createdAt: new Date().toISOString(),
      model,
      language: finalLanguage
    }

    return report
  } catch {
    // Error handled by caller/frontend
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
