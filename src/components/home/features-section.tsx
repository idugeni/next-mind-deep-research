"use client"

import { Brain, Search, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: <Search className="h-8 w-8 text-primary" />,
    title: "Pencarian Cerdas",
    description:
      "Temukan sumber penelitian relevan yang sesuai dengan kebutuhan Anda dengan menggunakan pencarian yang diperkuat AI. Dengan kemampuan AI yang canggih, Anda dapat menemukan sumber yang paling sesuai dengan kebutuhan Anda.",
  },
  {
    icon: <Brain className="h-8 w-8 text-primary" />,
    title: "Analisis AI",
    description:
      "Dapatkan wawasan mendalam dan rekomendasi yang relevan dari penelitian Anda dengan bantuan AI yang canggih. Dengan kemampuan analisis yang cepat dan akurat, Anda dapat lebih cepat memahami hasil penelitian dan membuat keputusan yang lebih baik.",
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: "Laporan Otomatis",
    description:
      "Buat laporan penelitian terstruktur secara otomatis dari hasil pencarian Anda, lengkap dengan analisis kritis, sintesis lintas sumber, dan rekomendasi yang relevan.",
  },
];

export default function FeaturesSection() {
  return (
    <div className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {features.map((feature, idx) => (
          <Card key={idx} className="transition-all duration-300 hover:shadow-lg hover:bg-accent/50 py-0">
            <CardContent className="p-6 space-y-2 flex flex-col items-center">
              <div className="flex items-center justify-center p-3 rounded-full bg-primary/10 transition-all duration-300 border border-primary/20 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-center">{feature.title}</h3>
              <p className="text-muted-foreground text-justify">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}