import { formatStatusLabel } from '../../lib/display'

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  reviewing: 'bg-sky-50 text-sky-800 ring-sky-200',
  interview: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  accepted: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-800 ring-rose-200',
}

export default function StatusBadge({ status }) {
  if (!status) return null
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 ring-slate-200'
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {formatStatusLabel(status)}
    </span>
  )
}
