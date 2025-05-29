export const formatLastAccessed = (date?: Date): string => {
  if (!date) return 'Never'
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)) * -1,
    'day'
  )
}
