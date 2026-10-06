const EXPERIENCE_LABELS = {
  intern: 'Intern',
  early: 'Early',
  mid: 'Mid',
  senior: 'Senior',
}

export function formatExperienceLevel(level) {
  if (!level) return '—'
  return EXPERIENCE_LABELS[level] || level
}

export function formatSalary(value) {
  if (value === null || value === undefined || value === '') return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString()
}

export function formatStatusLabel(status) {
  if (!status) return ''
  return status.charAt(0).toUpperCase() + status.slice(1)
}
