import { createRouter, createWebHistory } from 'vue-router'
import PdfListView from '../views/PdfListView.vue'
import PdfEditorView from '../views/PdfEditorView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'pdf-list',
      component: PdfListView,
    },
    {
      path: '/edit/:id',
      name: 'pdf-edit',
      component: PdfEditorView,
      props: true,
    },
  ],
})
