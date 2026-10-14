import fs from 'node:fs'
import path from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'

const VIRTUAL_ID = 'virtual:pdf-catalog'
const RESOLVED_ID = `\0${VIRTUAL_ID}`

function scanPdfs(pdfDir: string) {
  if (!fs.existsSync(pdfDir)) {
    return []
  }

  return fs
    .readdirSync(pdfDir)
    .filter((name) => name.toLowerCase().endsWith('.pdf'))
    .sort((a, b) => a.localeCompare(b, 'zh-CN'))
    .map((file) => {
      const title = file.replace(/\.pdf$/i, '')
      return {
        id: title,
        title,
        file,
      }
    })
}

function isPdfUnderDir(file: string, pdfDir: string) {
  const resolved = path.resolve(file)
  const dir = path.resolve(pdfDir)
  return (
    resolved.startsWith(dir + path.sep) &&
    resolved.toLowerCase().endsWith('.pdf')
  )
}

/** Keep virtual module ASCII-only so Chinese titles are not mis-decoded as Latin-1. */
function toAsciiJson(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/[\u0080-\uFFFF]/g, (ch) => {
    return `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`
  })
}

export function pdfCatalogPlugin(): Plugin {
  let root = process.cwd()
  const pdfDir = () => path.join(root, 'public', 'pdfs')

  function invalidate(server: ViteDevServer) {
    const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
    if (!mod) return
    server.moduleGraph.invalidateModule(mod)
    server.ws.send({ type: 'full-reload' })
  }

  return {
    name: 'pdf-catalog',
    configResolved(config) {
      root = config.root
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id !== RESOLVED_ID) return
      const items = scanPdfs(pdfDir())
      return `export const pdfCatalog = ${toAsciiJson(items)}\n`
    },
    configureServer(server) {
      const dir = pdfDir()
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      server.watcher.add(dir)

      const onFsChange = (file: string) => {
        if (isPdfUnderDir(file, dir) || path.resolve(file) === path.resolve(dir)) {
          invalidate(server)
        }
      }

      server.watcher.on('add', onFsChange)
      server.watcher.on('unlink', onFsChange)
      server.watcher.on('change', onFsChange)
    },
  }
}
