import { useId } from 'react'
import type { Transaction } from '../types'

export function ActivityChart({
  transactions,
  days,
  endDate,
}: {
  transactions: Transaction[]
  days: number
  endDate: string
}) {
  const id = useId().replaceAll(':', '')
  const end = new Date(endDate)
  end.setUTCHours(0, 0, 0, 0)
  const points = Array.from({ length: days }, (_, i) => {
    const d = new Date(end)
    d.setUTCDate(d.getUTCDate() - days + 1 + i)
    const day = d.toISOString().slice(0, 10)
    const items = transactions.filter((t) => t.occurred_at.slice(0, 10) === day)
    return {
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }),
      count: items.length,
      high: items.filter((t) => t.risk_level === 'HIGH').length,
    }
  })
  const max = Math.max(4, ...points.map((p) => p.count))
  const xy = (i: number, value: number) =>
    `${48 + (i / Math.max(1, points.length - 1)) * 654},${166 - (value / max) * 130}`
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${xy(i, p.count)}`).join(' ')
  return (
    <div className="activity-chart">
      <svg
        viewBox="0 0 740 212"
        role="img"
        aria-label={`Transaction activity over ${days} days: ${points.map((p) => `${p.date}, ${p.count} transactions, ${p.high} high risk`).join('; ')}`}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9b09d" stopOpacity=".12" />
            <stop offset="100%" stopColor="#c9b09d" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((n) => (
          <g key={n}>
            <line
              x1="48"
              y1={36 + n * 43.33}
              x2="704"
              y2={36 + n * 43.33}
              stroke="#2a2d30"
              strokeDasharray="3 5"
            />
            <text x="10" y={40 + n * 43.33} fill="#999da3" fontSize="11">
              {Math.round(max * (1 - n / 3))}
            </text>
          </g>
        ))}
        <path d={`${line} L702,166 L48,166 Z`} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke="#b9bfc6" strokeWidth="2" strokeLinejoin="round" />
        <path
          d={points.map((p, i) => `${i ? 'L' : 'M'}${xy(i, p.high)}`).join(' ')}
          fill="none"
          stroke="#ed8754"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <g key={p.date}>
            <circle
              cx={48 + (i / Math.max(1, points.length - 1)) * 654}
              cy={166 - (p.high / max) * 130}
              r="3"
              fill="#ed8754"
            >
              <title>
                {p.date}: {p.high} high-risk transactions
              </title>
            </circle>
            {(days <= 7 || i % 2 === 0) && (
              <text
                x={48 + (i / Math.max(1, points.length - 1)) * 654}
                y="198"
                fill="#999da3"
                fontSize="11"
                textAnchor="middle"
              >
                {p.date}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
