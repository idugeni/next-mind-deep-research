// src/hooks/use-document-title.ts
'use client'
import { useEffect } from 'react'
import { formatTitle } from '../lib/metadata'

/**
 * Hook to set document title with suffix, kecuali halaman utama
 * @param title Judul halaman (tanpa suffix)
 * @param isMain true jika halaman utama
 */
export function useDocumentTitle(title?: string, isMain = false) {
  useEffect(() => {
    if (!title && !isMain) return
    document.title = formatTitle(title, isMain)
  }, [title, isMain])
}

export default useDocumentTitle
