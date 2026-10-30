import type { Access, PayloadRequest } from 'payload'

// Staff = people who log into /admin (the "users" collection).
// Students also have accounts, but they must NEVER be able to change website content.
export const isStaff = (req: PayloadRequest) => req.user?.collection === 'users'
export const isAdmin = (req: PayloadRequest) =>
  req.user?.collection === 'users' && (req.user as { role?: string }).role === 'admin'

export const anyone: Access = () => true
export const loggedIn: Access = ({ req }) => isStaff(req)
export const adminOnly: Access = ({ req }) => isAdmin(req)

/** Staff see everything; a student only their own record. */
export const staffOrSelf: Access = ({ req }) => {
  if (isStaff(req)) return true
  if (req.user?.collection === 'students') return { id: { equals: req.user.id } }
  return false
}
