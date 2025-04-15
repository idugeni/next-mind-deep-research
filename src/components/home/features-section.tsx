"use client"

import { Brain, Search, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function FeaturesSection() {
  return (
    <div className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Card className="transition-all duration-300 hover:shadow-lg hover:bg-accent/50">
          <CardContent className="p-6 space-y-2 flex flex-col items-center">
            <div className="p-3 rounded-full bg-primary/10 transition-all duration-300">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-center">Pencarian Cerdas</h3>
            <p className="text-muted-foreground">
              Temukan sumber penelitian relevan dengan pencarian yang diperkuat AI.
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg hover:bg-accent/50">
          <CardContent className="p-6 space-y-2 flex flex-col items-center">
            <div className="p-3 rounded-full bg-primary/10 transition-all duration-300">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-center">Analisis AI</h3>
            <p className="text-muted-foreground">
              Dapatkan wawasan mendalam dari penelitian Anda dengan bantuan AI.
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg hover:bg-accent/50">
          <CardContent className="p-6 space-y-2 flex flex-col items-center">
            <div className="p-3 rounded-full bg-primary/10 transition-all duration-300">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-center">Laporan Otomatis</h3>
            <p className="text-muted-foreground">
              Buat laporan penelitian terstruktur secara otomatis dari hasil pencarian Anda.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}