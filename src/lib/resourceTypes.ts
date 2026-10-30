// One entry per kind of downloadable resource. `listPath` and `itemPrefix`
// match the old WordPress URLs so existing links and Google results keep working.
export const resourceTypes = [
  { value: 'cna', label: 'CSAP News Analysis (daily)', wpType: 'csap-news-analysis', wpFileKey: 'upload_news', listPath: 'csap-news-analysis', itemPrefix: 'csap-news-analysis' },
  { value: 'question-paper', label: 'Question Papers', wpType: 'question-paper', wpFileKey: 'media', listPath: 'question-papers', itemPrefix: 'question-paper' },
  { value: 'magazine', label: 'CNA Monthly Magazine', wpType: 'cna-monthly-magazine', wpFileKey: 'cna_media', listPath: 'cna-monthly-magazine', itemPrefix: 'cna-monthly-magazine' },
  { value: 'smartbook-sample', label: 'Sample Smartbook PDFs', wpType: 'sample-smartbook-pdf', wpFileKey: 'smartbook_pdf', listPath: 'sample-smartbook', itemPrefix: 'sample-smartbook-pdf' },
  { value: 'syllabus', label: 'Syllabus', wpType: 'syllabus', wpFileKey: 'upload_media', listPath: 'syllabus', itemPrefix: 'syllabus' },
] as const

export type ResourceTypeValue = (typeof resourceTypes)[number]['value']

export const resourceTypeByListPath = (p: string) => resourceTypes.find((t) => t.listPath === p)
export const resourceTypeByPrefix = (p: string) => resourceTypes.find((t) => t.itemPrefix === p)
export const resourceTypeByValue = (v: string) => resourceTypes.find((t) => t.value === v)
