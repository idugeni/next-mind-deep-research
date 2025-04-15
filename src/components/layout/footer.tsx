"use client"

import Link from "next/link"
import { Github } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4 md:h-24 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {currentYear} NextMind - Deep Research. All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/reports"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Reports
          </Link>
          <Link
            href="https://github.com/idugeni/next-mind-deep-research"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <Github className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </footer>
  )
}