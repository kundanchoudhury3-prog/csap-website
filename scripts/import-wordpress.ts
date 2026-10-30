/**
 * Imports content from a WordPress export (.xml) into the CSAP admin panel.
 *
 *   npm run import:wordpress -- ./export.xml
 *   npm run import:wordpress -- ./export.xml skip-files   (fast test, keeps PDFs/images on old site)
 *   npm run import:wordpress -- ./export.xml skip-pdfs    (images copied, PDFs stay linked to old site)
 *   npm run import:wordpress -- ./export.xml only=posts   (or only=pages / only=resources)
 *
 * Safe to run again: items are matched by their WordPress ID and updated, files already
 * downloaded are reused. Keep the old WordPress site online until the import finishes.
 */
import fs from 'fs'
import { getPayload } from 'payload'
import config from '@payload-config'
import { parseExport, projectJobs, runImport, testimonialJobs } from '../src/lib/wpImport'

// Options come as plain words after the file name (Payload's runner drops "--" flags)
const args = process.argv.slice(2)
const flag = (n: string) => args.some((a) => a.replace(/^-+/, '') === n)
const xmlPath = args.find((a) => a.toLowerCase().endsWith('.xml'))
const only = args.find((a) => a.replace(/^-+/, '').startsWith('only='))?.split('=')[1] as 'posts' | 'pages' | 'resources' | 'projects' | 'testimonials' | undefined

async function main() {
  if (!xmlPath || !fs.existsSync(xmlPath)) {
    console.error('Give the path of the WordPress export file, e.g.\n  npm run import:wordpress -- ./export.xml')
    process.exit(1)
  }
  const payload = await getPayload({ config })
  console.log('Reading', xmlPath)
  const parsed = only === 'projects' ? projectJobs() : only === 'testimonials' ? testimonialJobs() : parseExport(fs.readFileSync(xmlPath, 'utf8'), only)
  console.log(`${parsed.jobs.length} items to import`)
  const r = await runImport(payload, parsed, { skipFiles: flag('skip-files'), skipPdfs: flag('skip-pdfs'), log: console.log })
  const s = r.stats
  console.log('\n========== Import finished ==========')
  console.log(`Blog posts: ${s.posts}   Announcements: ${s.announcements}   New categories: ${s.categories}`)
  console.log(`Pages (drafts to rebuild): ${s.pages}`)
  for (const [k, v] of Object.entries(s.resources)) console.log(`${k}: ${v}`)
  console.log(`Files downloaded: ${s.files}   Redirects added: ${s.redirects}`)
  if (s.fileErrors.length) {
    fs.writeFileSync('import-file-errors.txt', s.fileErrors.join('\n'))
    console.log(`Files that could not be downloaded: ${s.fileErrors.length} (list saved in import-file-errors.txt)`)
  }
  if (s.errors.length) {
    fs.writeFileSync('import-errors.txt', s.errors.join('\n'))
    console.log(`Items with errors: ${s.errors.length} (list saved in import-errors.txt)`)
  }
  process.exit(0)
}

// Top-level await: Payload's runner exits as soon as this module finishes loading.
try {
  await main()
} catch (e) {
  console.error(e)
  process.exit(1)
}
