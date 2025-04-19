"use client"

import Link from "next/link"
import { Github, Linkedin, Mail, Brain } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-gradient-to-b from-background via-accent/10 to-background/80 py-8 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:justify-between items-center gap-8 md:gap-0">
        {/* Kiri: Logo & Tagline */}
        <div className="flex flex-col items-center md:items-start gap-2 md:gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg tracking-tight text-foreground">NextMind</span>
          </div>
          <span className="text-xs text-muted-foreground text-center md:text-left max-w-xs">
            Deep Research Platform — Temukan, analisis, dan susun laporan riset secara cerdas dan efisien.
          </span>
        </div>

        {/* Tengah: Navigasi */}
        <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors">Home</Link>
          <Link href="/reports" className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors">Reports</Link>
          <Link href="/about" className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors">About</Link>
          <Link href="mailto:contact@oldsoul.id" className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors">Contact</Link>
        </nav>

        {/* Kanan: Socials & Copyright */}
        <div className="flex flex-col items-center md:items-end gap-2 md:gap-3">
          <div className="flex gap-3 mb-1">
            <Link href="https://github.com/idugeni/next-mind-deep-research" target="_blank" aria-label="GitHub" className="hover:text-primary text-muted-foreground transition-colors">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="https://linkedin.com/in/idugeni" target="_blank" aria-label="LinkedIn" className="hover:text-primary text-muted-foreground transition-colors">
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link href="mailto:contact@oldsoul.id" aria-label="Email" className="hover:text-primary text-muted-foreground transition-colors">
              <Mail className="h-5 w-5" />
            </Link>
          </div>
          <span className="text-xs text-muted-foreground text-center md:text-right">
            {currentYear} NextMind - Deep Research. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}