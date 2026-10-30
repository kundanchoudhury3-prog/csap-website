import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export function RichTextView({ data }: { data: unknown }) {
  if (!data || typeof data !== 'object' || !('root' in (data as object))) return null
  return <RichText className="prose" data={data as SerializedEditorState} />
}
