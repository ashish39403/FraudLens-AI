/** A compact, decorative view of actual daily record counts. */
export function MetricSparkline({
  dates,
  endDate,
  days,
}: {
  dates: string[]
  endDate: string
  days: number
}) {
  const end = new Date(endDate)
  const values = Array.from({ length: days }, (_, i) => {
    const day = new Date(end)
    day.setUTCDate(day.getUTCDate() - days + 1 + i)
    return dates.filter((value) => value.slice(0, 10) === day.toISOString().slice(0, 10)).length
  })
  const max = Math.max(1, ...values)
  const path = values
    .map(
      (value, index) =>
        `${index ? 'L' : 'M'}${(index / Math.max(1, days - 1)) * 88},${27 - (value / max) * 24}`,
    )
    .join(' ')
  return (
    <svg className="sparkline" viewBox="0 0 90 30" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
