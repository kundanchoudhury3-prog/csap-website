import type { DemoClass } from '@/payload-types'
import type { DemoVideo } from '@/components/DemoVideos'
import { mediaUrl } from './media'
import { ytId, ytThumb } from './youtube'

export function toDemoVideos(docs: DemoClass[]): DemoVideo[] {
  return docs.flatMap((d) => {
    const id = d.videoId || ytId(d.youtubeUrl)
    if (!id) return []
    return [{ id, title: d.title || 'CSAP free demo class', subject: d.subject, thumb: mediaUrl(d.thumbnail, 'card') || ytThumb(id) }]
  })
}
