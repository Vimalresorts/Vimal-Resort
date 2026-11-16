/**
 * Every fact on the site carries a source key so the content stays auditable.
 * netlify = https://vimalresort.netlify.app/ (primary source of truth)
 * mapx    = https://mapx.world/vimal-resort (virtual tour; secondary)
 * Audited: 16 Nov 2026.
 */
export type SourceKey = 'netlify' | 'mapx'

export const SOURCES: Record<SourceKey, { label: string; url: string }> = {
  netlify: { label: 'Resort website', url: 'https://vimalresort.netlify.app/' },
  mapx: { label: 'MapX virtual tour', url: 'https://mapx.world/vimal-resort' },
}

export const AUDIT_DATE = '16 Nov 2026'
