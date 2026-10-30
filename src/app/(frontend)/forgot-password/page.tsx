import { AuthLayout } from '@/components/AuthLayout'
import { ForgotForm } from '@/components/AuthForms'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Forgot password | CSAP IAS Academy' }

export default async function ForgotPasswordPage() {
  const emailReady = Boolean(process.env.SMTP_HOST)
  return (
    <AuthLayout pill="Forgot password" title="Enter your email and we'll send you a link to set a new password">
      {emailReady ? (
        <ForgotForm />
      ) : (
        <div className="form-msg err" style={{ maxWidth: 520 }}>
          Password reset by email is being set up. Please call us at +91-91275-15541 and we will help you reset your password.
        </div>
      )}
    </AuthLayout>
  )
}
