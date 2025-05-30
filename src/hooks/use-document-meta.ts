'use client'
import { useEffect } from 'react'

/**
 * Hook untuk mengatur document.title dan meta description secara client-side
 * @param title Judul halaman (document.title)
 * @param description Meta description
 */
export function useDocumentMeta(title?: string, description?: string) {
  useEffect(() => {
    if (title) document.title = title
    if (description) {
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', description)
    }
  }, [title, description])
}

export default useDocumentMeta
