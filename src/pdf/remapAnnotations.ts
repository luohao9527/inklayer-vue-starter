import type { Annotation } from 'inklayer-vue'

/**
 * Drop annotations on deleted pages and shift pageIndex for pages after each deletion.
 * `deletedPageIndexes` are 0-based; order does not matter.
 */
export function remapAnnotationsAfterPageDeletes(
  annotations: Annotation[],
  deletedPageIndexes: number[],
): Annotation[] {
  const deleted = new Set(deletedPageIndexes)

  return annotations
    .filter((annotation) => !deleted.has(annotation.target.pageIndex))
    .map((annotation) => {
      const shift = deletedPageIndexes.filter(
        (index) => index < annotation.target.pageIndex,
      ).length

      if (shift === 0) return annotation

      return {
        ...annotation,
        target: {
          ...annotation.target,
          pageIndex: annotation.target.pageIndex - shift,
        },
      }
    })
}
