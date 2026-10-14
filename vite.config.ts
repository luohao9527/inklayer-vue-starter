import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { pdfCatalogPlugin } from './vite-plugin-pdf-catalog.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), pdfCatalogPlugin()],
})
