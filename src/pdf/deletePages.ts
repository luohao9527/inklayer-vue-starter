import { PDFDocument } from 'pdf-lib'

/** Tight copy so PDF.js worker transfer cannot empty our authoritative bytes. */
export function clonePdfBytes(bytes: Uint8Array): Uint8Array {
  return bytes.slice()
}

/**
 * Remove pages from a PDF. `pageIndexes` are 0-based.
 * Indexes are applied from highest to lowest so earlier removals do not shift later ones.
 */
export async function removePdfPages(
  bytes: Uint8Array,
  pageIndexes: number[],
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(clonePdfBytes(bytes))
  const pageCount = pdf.getPageCount()

  if (pageCount <= 1) {
    throw new Error('Cannot delete the last remaining page')
  }

  const unique = [...new Set(pageIndexes)].sort((a, b) => b - a)

  for (const index of unique) {
    if (index < 0 || index >= pageCount) {
      throw new Error(`Invalid page index: ${index}`)
    }
    if (pdf.getPageCount() <= 1) {
      throw new Error('Cannot delete the last remaining page')
    }
    pdf.removePage(index)
  }

  // pdf-lib may return a view into a larger buffer; normalize for PDF.js.
  return clonePdfBytes(await pdf.save())
}

export async function getPdfPageCount(bytes: Uint8Array): Promise<number> {
  const pdf = await PDFDocument.load(clonePdfBytes(bytes))
  return pdf.getPageCount()
}
