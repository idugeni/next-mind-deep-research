export type SearchLanguage = "id" | "en"

export interface CSEImage {
  src?: string;
}

export interface MetaTag {
  datePublished?: string;
  [key: string]: string | undefined;
}

export interface PageMap {
  cse_image?: CSEImage[];
  metatags?: MetaTag[];
  [key: string]: unknown;
}

export interface SearchResult {
  title: string;
  link: string;
  displayLink: string;
  snippet: string;
  type?: string; // opsional, bisa pdf, video, dsb
  mime?: string; // opsional, tipe file
  pagemap?: PageMap; // lebih detail, agar tidak error saat akses
  // Untuk pemilihan cerdas (opsional, bisa diisi dari API atau hasil scoring)
  important?: boolean;
  score?: number;
}
