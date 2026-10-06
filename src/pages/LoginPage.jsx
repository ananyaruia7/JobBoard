import LoginForm from '../components/auth/LoginForm'
import PageShell, { PageHeader } from '../components/layout/PageShell'

export default function LoginPage() {
  return (
    <PageShell withNav={false}>
      <div className="mx-auto max-w-md">
        <PageHeader
          title="Log in"
          subtitle="Sign in to continue to JobBoard."
        />
        <div className="jb-card">
          <LoginForm />
        </div>
      </div>
    </PageShell>
  )
}
