declare module 'virtual:pdf-catalog' {
  export interface PdfCatalogItem {
    id: string
    title: string
    file: string
  }

  export const pdfCatalog: PdfCatalogItem[]
}
