"use client"

import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <div className="py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">NextMind - Deep Research</h1>
        <p className="text-xl text-muted-foreground max-w-6xl mx-auto">
          Platform penelitian cerdas yang menggabungkan kekuatan AI untuk membantu Anda menemukan, menganalisis, dan mengorganisir informasi penelitian dengan lebih efektif.
        </p>
      </div>

      <div className="text-center">
        <p className="text-muted-foreground">
          Mulai penelitian Anda sekarang dengan memasukkan topik di bawah ini
          <ArrowRight className="inline-block ml-2 h-4 w-4" />
        </p>
      </div>
    </div>
  )
}