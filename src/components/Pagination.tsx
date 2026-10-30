export function Pagination({ page, totalPages, makeHref }: { page: number; totalPages: number; makeHref: (p: number) => string }) {
  if (totalPages <= 1) return null
  return (
    <nav className="pager" aria-label="Pages">
      {page > 1 ? <a className="btn btn-ghost-dark btn-sm" href={makeHref(page - 1)}>← Newer</a> : <span />}
      <span>Page {page} of {totalPages}</span>
      {page < totalPages ? <a className="btn btn-ghost-dark btn-sm" href={makeHref(page + 1)}>Older →</a> : <span />}
    </nav>
  )
}
