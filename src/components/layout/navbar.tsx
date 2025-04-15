"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import Image from "next/image"

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur-xs supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="NextMind Logo" width={24} height={24} />
            <span className="font-bold text-xl">NextMind</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-4">
            <Link href="/">
              <Button variant={pathname === "/" ? "default" : "ghost"}>Search</Button>
            </Link>
            <Link href="/reports">
              <Button variant={pathname.startsWith("/reports") ? "default" : "ghost"}>Reports</Button>
            </Link>
          </nav>

          <ModeToggle />

          <div className="md:hidden">
            <Link href={pathname === "/" ? "/reports" : "/"}>
              <Button variant="outline" size="sm">
                {pathname === "/" ? "Reports" : "Search"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
