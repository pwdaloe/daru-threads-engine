export const LEAD_TYPE_OPTIONS = [
  { value: 'CANDIDATE', label: 'Calon Karyawan' },
  { value: 'PARTNER', label: 'Mitra' },
  { value: 'CLIENT', label: 'Prospek Client' }
] as const

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  MANUAL: 'Input Manual',
  PUBLIC_FORM: 'Form Public'
}

export const LEAD_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  LEAD_TYPE_OPTIONS.map((option) => [option.value, option.label])
)
