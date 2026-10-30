import { redirect } from 'next/navigation'
import { AuthLayout } from '@/components/AuthLayout'
import { LoginForm } from '@/components/AuthForms'
import { getViewer, safeNext } from '@/lib/viewer'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Login — Free Resources | CSAP IAS Academy' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next)
  const { student } = await getViewer()
  if (student) redirect(next)
  return (
    <AuthLayout pill="Welcome back" title="Login to download free resources">
      <LoginForm next={next} />
    </AuthLayout>
  )
}
