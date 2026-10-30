import { redirect } from 'next/navigation'
import { AuthLayout } from '@/components/AuthLayout'
import { RegisterForm } from '@/components/AuthForms'
import { getViewer, safeNext } from '@/lib/viewer'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Register — Free Resources | CSAP IAS Academy' }

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next)
  const { student } = await getViewer()
  if (student) redirect(next)
  return (
    <AuthLayout pill="Welcome to CSAP" title="To download our Current Affairs and Premium Resources for FREE, please register here">
      <RegisterForm next={next} />
    </AuthLayout>
  )
}
