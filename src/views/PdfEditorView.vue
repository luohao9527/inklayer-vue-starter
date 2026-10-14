<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PdfAnnotator } from 'inklayer-vue'
import type { Annotation } from 'inklayer-vue'
import 'inklayer-vue/style'
import { findPdfById, getPdfUrl } from '../pdf/catalog'
import {
  clonePdfBytes,
  getPdfPageCount,
  removePdfPages,
} from '../pdf/deletePages'
import { remapAnnotationsAfterPageDeletes } from '../pdf/remapAnnotations'

const props = defineProps<{ id: string }>()

const router = useRouter()
const catalogItem = computed(() => findPdfById(props.id))

/** Authoritative PDF bytes — never pass this same reference into PdfAnnotator. */
const pdfBytes = shallowRef<Uint8Array | null>(null)
/** Fresh copy for the viewer; PDF.js may transfer/detach the ArrayBuffer. */
const viewerPdfData = shallowRef<Uint8Array | null>(null)
const annotations = ref<Annotation[]>([])
const annotatorKey = ref(0)
const pageToDelete = ref(1)
const pageCount = ref(0)
const loading = ref(true)
const deleting = ref(false)
const loadError = ref<string | null>(null)

const canDelete = computed(
  () =>
    !deleting.value &&
    pdfBytes.value !== null &&
    pageCount.value > 1 &&
    pageToDelete.value >= 1 &&
    pageToDelete.value <= pageCount.value,
)

function setPdfDocument(bytes: Uint8Array) {
  const owned = clonePdfBytes(bytes)
  pdfBytes.value = owned
  viewerPdfData.value = clonePdfBytes(owned)
}

async function loadPdf() {
  loading.value = true
  loadError.value = null
  pdfBytes.value = null
  viewerPdfData.value = null
  annotations.value = []
  annotatorKey.value += 1

  const item = catalogItem.value
  if (!item) {
    loadError.value = `PDF not found: ${props.id}`
    loading.value = false
    return
  }

  try {
    const response = await fetch(getPdfUrl(item))
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`)
    }
    const buffer = await response.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    setPdfDocument(bytes)
    pageCount.value = await getPdfPageCount(bytes)
    pageToDelete.value = 1
  } catch (error) {
    loadError.value =
      error instanceof Error ? error.message : 'Failed to load PDF'
  } finally {
    loading.value = false
  }
}

function handleSave(data: Annotation[]) {
  annotations.value = data
  console.log('saved:', data)
}

async function deleteSelectedPage(getAnnotations: () => Annotation[]) {
  if (!pdfBytes.value || !canDelete.value) return

  const pageNumber = pageToDelete.value
  if (
    !confirm(
      `Delete page ${pageNumber}? Annotations on this page will be removed.`,
    )
  ) {
    return
  }

  deleting.value = true
  try {
    const currentAnnotations = getAnnotations()
    const pageIndex = pageNumber - 1
    const nextBytes = await removePdfPages(pdfBytes.value, [pageIndex])
    const nextAnnotations = remapAnnotationsAfterPageDeletes(
      currentAnnotations,
      [pageIndex],
    )

    setPdfDocument(nextBytes)
    annotations.value = nextAnnotations
    pageCount.value = await getPdfPageCount(nextBytes)
    pageToDelete.value = Math.min(pageToDelete.value, pageCount.value)
    annotatorKey.value += 1
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Failed to delete page')
  } finally {
    deleting.value = false
  }
}

function goBack() {
  router.push({ name: 'pdf-list' })
}

onMounted(loadPdf)
watch(() => props.id, loadPdf)
</script>

<template>
  <div v-if="loading" class="status">Loading PDF…</div>
  <div v-else-if="loadError" class="status error">
    <p>{{ loadError }}</p>
    <button type="button" class="back-btn" @click="goBack">Back to list</button>
  </div>
  <PdfAnnotator
    v-else-if="viewerPdfData"
    :key="annotatorKey"
    :data="viewerPdfData"
    :initial-annotations="annotations"
    :title="catalogItem?.title ?? 'PDF Editor'"
    :user="{ id: 'demo', name: 'Demo User' }"
    :layout-style="{ width: '100vw', height: '100vh' }"
    :default-show-annotations-sidebar="true"
    @save="handleSave"
  >
    <template #actions="{ getAnnotations, exportToPdf }">
      <div class="page-actions">
        <button type="button" class="page-actions__btn" @click="goBack">
          Back
        </button>
        <label class="page-actions__label">
          Page
          <input
            v-model.number="pageToDelete"
            class="page-actions__input"
            type="number"
            min="1"
            :max="pageCount"
            :disabled="deleting"
          />
          / {{ pageCount }}
        </label>
        <button
          type="button"
          class="page-actions__btn"
          :disabled="!canDelete"
          @click="deleteSelectedPage(getAnnotations)"
        >
          {{ deleting ? 'Deleting…' : 'Delete page' }}
        </button>
        <button
          type="button"
          class="page-actions__btn"
          :disabled="deleting"
          @click="exportToPdf(catalogItem?.id ?? 'export')"
        >
          Export PDF
        </button>
      </div>
    </template>
  </PdfAnnotator>
</template>

<style scoped>
.status {
  display: grid;
  place-content: center;
  gap: 12px;
  height: 100vh;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  text-align: center;
}

.status.error {
  color: #b42318;
}

.back-btn,
.page-actions__btn {
  padding: 4px 10px;
  font-size: 13px;
  cursor: pointer;
}

.back-btn {
  justify-self: center;
  padding: 8px 14px;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 8px;
}

.page-actions__label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  white-space: nowrap;
}

.page-actions__input {
  width: 56px;
  padding: 2px 6px;
}

.page-actions__btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
