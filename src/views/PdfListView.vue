<script setup lang="ts">
import { useRouter } from 'vue-router'
import { pdfCatalog, getPdfDisplayPath } from '../pdf/catalog'

const router = useRouter()

function openEditor(id: string) {
  router.push({ name: 'pdf-edit', params: { id } })
}
</script>

<template>
  <div class="list-page">
    <header class="list-page__header">
      <h1 class="list-page__title">PDF Documents</h1>
      <p class="list-page__hint">
        Drop PDF files into <code>public/pdfs</code> — the list updates
        automatically.
      </p>
    </header>

    <p v-if="pdfCatalog.length === 0" class="list-page__empty">
      No PDFs yet. Add a <code>.pdf</code> file under <code>public/pdfs</code>.
    </p>

    <ul v-else class="card-grid">
      <li v-for="item in pdfCatalog" :key="item.id" class="card">
        <div class="card__body">
          <h2 class="card__title">{{ item.title }}</h2>
          <p class="card__meta">{{ getPdfDisplayPath(item) }}</p>
        </div>
        <button type="button" class="card__edit" @click="openEditor(item.id)">
          Edit
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.list-page {
  --ink: #1c1917;
  --muted: #78716c;
  --surface: #fafaf9;
  --line: #e7e5e4;
  --accent: #0f766e;

  min-height: 100vh;
  box-sizing: border-box;
  padding: 48px 24px 64px;
  background:
    radial-gradient(ellipse 80% 50% at 10% 0%, #ccfbf1 0%, transparent 55%),
    linear-gradient(180deg, #f5f5f4 0%, var(--surface) 40%);
  color: var(--ink);
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.list-page__header {
  max-width: 960px;
  margin: 0 auto 36px;
}

.list-page__title {
  margin: 0 0 8px;
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 650;
  letter-spacing: -0.02em;
}

.list-page__hint {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.5;
}

.list-page__hint code,
.list-page__empty code {
  font-size: 0.85em;
  padding: 0.1em 0.35em;
  border-radius: 4px;
  background: #e7e5e4;
}

.list-page__empty {
  max-width: 960px;
  margin: 0 auto;
  color: var(--muted);
}

.card-grid {
  list-style: none;
  margin: 0 auto;
  padding: 0;
  max-width: 960px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
}

.card__body {
  flex: 1;
}

.card__title {
  margin: 0 0 6px;
  font-size: 1.1rem;
  font-weight: 600;
}

.card__meta {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
  word-break: break-all;
}

.card__edit {
  align-self: flex-start;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.card__edit:hover {
  background: #0d9488;
}

.card__edit:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
