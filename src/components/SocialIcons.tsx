type Follow = { facebook?: string | null; instagram?: string | null; youtube?: string | null; telegram?: string | null; x?: string | null; linkedin?: string | null }

const icons: Record<keyof Follow, { label: string; path: string }> = {
  facebook: { label: 'Facebook', path: 'M14 8.5V6.8c0-.8.5-1 .9-1H17V2.1L14.1 2C10.9 2 10.2 4.4 10.2 6v2.5H8v3.8h2.2V22H14v-9.7h2.9l.4-3.8z' },
  instagram: { label: 'Instagram', path: 'M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM21.9 8.1c-.1-1.6-.4-3-1.6-4.2S17.6 2.2 16 2.1C14.3 2 9.7 2 8 2.1c-1.6.1-3 .4-4.2 1.6S2.2 6.4 2.1 8C2 9.7 2 14.3 2.1 16c.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.7.1 6.3.1 8 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.7.1-6.3.2-7.9zm-2.2 9.8a3.2 3.2 0 0 1-1.8 1.8c-1.3.5-4.3.4-5.9.4s-4.6.1-5.9-.4a3.2 3.2 0 0 1-1.8-1.8c-.5-1.3-.4-4.3-.4-5.9s-.1-4.6.4-5.9a3.2 3.2 0 0 1 1.8-1.8c1.3-.5 4.3-.4 5.9-.4s4.6-.1 5.9.4a3.2 3.2 0 0 1 1.8 1.8c.5 1.3.4 4.3.4 5.9s.1 4.6-.4 5.9z' },
  youtube: { label: 'YouTube', path: 'M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15V9l5.8 3z' },
  telegram: { label: 'Telegram', path: 'M21.9 4.3 18.7 19.4c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13 1.4 11.5c-1-.3-1.1-1 .2-1.5L20.5 2.8c.9-.3 1.7.2 1.4 1.5z' },
  x: { label: 'X', path: 'M17.8 2.5h3.3l-7.2 8.2 8.5 11.2h-6.6l-5.2-6.8-6 6.8H1.3l7.7-8.8L.9 2.5h6.8l4.7 6.2zm-1.2 17.4h1.8L6.6 4.4H4.6z' },
  linkedin: { label: 'LinkedIn', path: 'M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.5H3.6V9h3.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z' },
}

export function SocialIcons({ follow }: { follow?: Follow | null }) {
  const items = (Object.keys(icons) as (keyof Follow)[]).filter((k) => follow?.[k]?.trim())
  if (!items.length) return null
  return (
    <div className="social">
      {items.map((k) => (
        <a key={k} href={follow![k]!.trim()} target="_blank" rel="noopener noreferrer" aria-label={`CSAP on ${icons[k].label}`} className={`social-${k}`} title={icons[k].label}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={icons[k].path} /></svg>
        </a>
      ))}
    </div>
  )
}
