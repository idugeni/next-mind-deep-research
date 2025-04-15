import { SearchResult } from "@/types/search"

export function detectResultType(result: SearchResult): SearchResult["type"] {
  const url = result.link.toLowerCase();
  if (url.endsWith('.pdf')) return 'pdf';
  if (url.endsWith('.doc') || url.endsWith('.docx')) return 'word';
  if (url.endsWith('.xls') || url.endsWith('.xlsx')) return 'spreadsheet';
  if (url.endsWith('.ppt') || url.endsWith('.pptx')) return 'presentation';
  if (url.match(/\.(jpg|jpeg|png|gif|bmp|svg)(\?|$)/)) return 'image';
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) return 'video';
  if (url.includes('news.google.com') || url.includes('cnn.com') || url.includes('bbc.co') || url.includes('detik.com') || url.includes('kompas.com')) return 'news';
  if (url.includes('maps.google.com') || url.includes('goo.gl/maps')) return 'map';
  if (url.includes('twitter.com') || url.includes('facebook.com') || url.includes('linkedin.com') || url.includes('instagram.com')) return 'social';
  if (url.startsWith('http')) return 'web';
  return 'other';
}

export function categorizeResults(results: SearchResult[]): SearchResult[] {
  return results.map(r => ({ ...r, type: detectResultType(r) }));
}
