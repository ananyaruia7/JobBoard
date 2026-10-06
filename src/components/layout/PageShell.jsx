import Navbar from './Navbar'

export function LoadingMessage({ children = 'Loading...' }) {
  return <p className="text-sm text-slate-500">{children}</p>
}

export function EmptyState({ children }) {
  return (
    <div className="jb-card py-10 text-center text-slate-600">{children}</div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

export default function PageShell({ children, withNav = true }) {
  return (
    <div className="jb-page">
      {withNav ? (
        <Navbar />
      ) : (
        <header className="border-b border-slate-200 bg-white">
          <div className="jb-container flex h-16 items-center">
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              JobBoard
            </span>
          </div>
        </header>
      )}
      <main className="jb-container py-8 sm:py-10">{children}</main>
    </div>
  )
}
