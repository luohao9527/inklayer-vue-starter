import { pdfCatalog } from 'virtual:pdf-catalog'
import type { PdfCatalogItem } from 'virtual:pdf-catalog'

export type { PdfCatalogItem }
export { pdfCatalog }

/** Human-readable path for UI (keeps Chinese filenames readable). */
export function getPdfDisplayPath(item: PdfCatalogItem): string {
  return `/pdfs/${item.file}`
}

/** Encoded URL for fetch / navigation. */
export function getPdfUrl(item: PdfCatalogItem): string {
  return `/pdfs/${encodeURIComponent(item.file)}`
}

export function findPdfById(id: string): PdfCatalogItem | undefined {
  return pdfCatalog.find((item) => item.id === id)
}
