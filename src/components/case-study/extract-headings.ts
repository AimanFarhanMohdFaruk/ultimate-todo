/**
 * Extract h2 and h3 headings from markdown for table-of-contents.
 * Ids are slugified for anchor links.
 */
export type TocEntry = { level: 2 | 3; text: string; id: string }

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function extractHeadings(markdown: string): TocEntry[] {
  const entries: TocEntry[] = []
  const lines = markdown.split('\n')
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/)
    const h3 = line.match(/^###\s+(.+)$/)
    if (h2) {
      entries.push({ level: 2, text: h2[1].trim(), id: slugify(h2[1]) })
    } else if (h3) {
      entries.push({ level: 3, text: h3[1].trim(), id: slugify(h3[1]) })
    }
  }
  return entries
}
