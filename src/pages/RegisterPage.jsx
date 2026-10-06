import RegisterForm from '../components/auth/RegisterForm'
import PageShell, { PageHeader } from '../components/layout/PageShell'

export default function RegisterPage() {
  return (
    <PageShell withNav={false}>
      <div className="mx-auto max-w-md">
        <PageHeader
          title="Create an account"
          subtitle="Register as a jobseeker or recruiter."
        />
        <div className="jb-card">
          <RegisterForm />
        </div>
      </div>
    </PageShell>
  )
}
