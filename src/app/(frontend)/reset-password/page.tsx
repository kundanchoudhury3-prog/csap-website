import { AuthLayout } from '@/components/AuthLayout'
import { ResetForm } from '@/components/AuthForms'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Set a new password | CSAP IAS Academy', robots: { index: false } }

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  return (
    <AuthLayout pill="New password" title="Choose a new password for your account">
      {token ? (
        <ResetForm token={token} />
      ) : (
        <div className="form-msg err" style={{ maxWidth: 520 }}>
          This link is incomplete. Please open the link from your email again, or <a href="/forgot-password">ask for a new one</a>.
        </div>
      )}
    </AuthLayout>
  )
}
