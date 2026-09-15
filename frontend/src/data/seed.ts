import type { Customer, Dataset, Investigation, RiskLevel, Transaction } from '../types'

export const DEMO_EMAIL = 'analyst@fraudlens.ai'
export const DEMO_PASSWORD = 'Demo@2026'
export const DEMO_NOW = '2026-09-12T11:30:00Z'
const date = (day: number, hour = 10, minute = 0) =>
  `2026-09-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`
const profiles: [string, Customer['customer_type'], string, Customer['kyc_status'], RiskLevel][] = [
  ['Meridian Trading Ltd', 'BUSINESS', 'United Kingdom', 'VERIFIED', 'HIGH'],
  ['Arjun Mehta', 'INDIVIDUAL', 'India', 'VERIFIED', 'LOW'],
  ['Northstar Imports', 'BUSINESS', 'Singapore', 'PENDING', 'HIGH'],
  ['Sofia Chen', 'INDIVIDUAL', 'Singapore', 'VERIFIED', 'LOW'],
  ['Atlas Commerce FZE', 'BUSINESS', 'United Arab Emirates', 'VERIFIED', 'HIGH'],
  ['Oliver Bennett', 'INDIVIDUAL', 'United Kingdom', 'VERIFIED', 'MEDIUM'],
  ['Priya Sharma', 'INDIVIDUAL', 'India', 'VERIFIED', 'LOW'],
  ['Elmwood Logistics', 'BUSINESS', 'United States', 'PENDING', 'MEDIUM'],
  ['Daniel Weber', 'INDIVIDUAL', 'Germany', 'VERIFIED', 'LOW'],
  ['Bluewater Exports', 'BUSINESS', 'United Kingdom', 'REJECTED', 'HIGH'],
  ['Isabella Rossi', 'INDIVIDUAL', 'Italy', 'VERIFIED', 'LOW'],
  ['Cedar & Co.', 'BUSINESS', 'United States', 'VERIFIED', 'LOW'],
]
const customers: Customer[] = profiles.map(
  ([full_name, customer_type, country, kyc_status, risk_level], i) => ({
    id: i + 1,
    external_customer_id: `CUS-${String(1001 + i)}`,
    full_name,
    customer_type,
    country,
    kyc_status,
    risk_level,
    created_at: '2026-04-14T09:00:00Z',
    updated_at: date(10),
  }),
)
const counterparties = [
  'Orion Holdings',
  'Riverbank Services',
  'Eastport Trading',
  'Harbor Technologies',
  'Crescent Ventures',
  'Westbridge Supply',
  'Aster Retail',
  'Oakfield Partners',
]
const amounts = [
  '48750.00',
  '2450.00',
  '9850.00',
  '680.00',
  '72500.00',
  '18900.00',
  '1250.00',
  '24600.00',
  '320.00',
  '9400.00',
  '780.00',
  '5600.00',
]
const transactions: Transaction[] = Array.from({ length: 84 }, (_, i) => {
  const customer_id = (i % 12) + 1
  const risk_level: RiskLevel =
    [0, 2, 4, 9].includes(i % 12) && i < 24 ? 'HIGH' : i % 5 === 0 ? 'MEDIUM' : 'LOW'
  const dayOffset = [12, 22, 38, 46, 60, 71, 84].findIndex((end) => i < end)
  const occurred_at = date(12 - dayOffset, 11 - Math.floor((i % 12) / 3), 24 - (i % 3) * 7)
  return {
    id: 10842 - i,
    customer_id,
    counterparty_name: counterparties[i % 8],
    counterparty_account: `**** ${4028 + i * 17}`,
    direction: i % 3 === 0 ? 'INBOUND' : 'OUTBOUND',
    amount: amounts[i % 12],
    currency: i % 12 === 1 || i % 12 === 6 ? 'INR' : 'USD',
    transaction_type: (
      [
        'WIRE',
        'UPI',
        'TRANSFER',
        'CARD',
        'WIRE',
        'TRANSFER',
        'UPI',
        'WIRE',
        'CARD',
        'CASH',
        'CARD',
        'TRANSFER',
      ] as const
    )[i % 12],
    status: i === 9 ? 'FAILED' : risk_level === 'HIGH' ? 'PENDING' : 'SUCCESS',
    occurred_at,
    created_at: occurred_at,
    risk_level,
    risk_signals:
      risk_level === 'HIGH'
        ? [i % 2 ? 'Potential structuring' : 'Unusual transfer volume', 'New counterparty']
        : risk_level === 'MEDIUM'
          ? ['Outside usual activity']
          : [],
  }
})
export function buildDemoReport(
  transaction: Transaction,
  id: number,
  created_at = DEMO_NOW,
): Investigation {
  const high = transaction.risk_level === 'HIGH'
  const medium = transaction.risk_level === 'MEDIUM'
  return {
    id,
    transaction_id: transaction.id,
    customer_id: transaction.customer_id,
    created_by_user_id: 1,
    risk_level: transaction.risk_level ?? 'LOW',
    risk_score: high ? 87 : medium ? 54 : 18,
    summary: high
      ? `The ${transaction.transaction_type.toLowerCase()} to ${transaction.counterparty_name} warrants further review. The demo scenario shows a new counterparty and activity outside the customer's expected transaction profile. These indicators are not a determination of financial crime.`
      : `The transaction involving ${transaction.counterparty_name} ${medium ? 'deviates from the expected activity profile and needs contextual review' : 'shows no elevated signals in the available demo data'}. Confirm the transaction purpose before concluding the review.`,
    suspicious_patterns: transaction.risk_signals ?? [],
    evidence: [
      `Transaction TXN-${transaction.id}: ${transaction.currency} ${transaction.amount} (${transaction.direction.toLowerCase()}).`,
      `Counterparty recorded as ${transaction.counterparty_name}, account ${transaction.counterparty_account}.`,
      `Payment status is ${transaction.status.toLowerCase()}; type is ${transaction.transaction_type.toLowerCase()}.`,
      `Customer profile is linked to CUS-${1000 + transaction.customer_id}.`,
    ],
    recommended_action: high
      ? 'Escalate for enhanced due diligence. Verify the source of funds and the commercial relationship before recording a final decision.'
      : medium
        ? 'Request the payment purpose and supporting documentation. Continue monitoring related activity.'
        : 'Complete standard analyst review and document the rationale for closure.',
    confidence: high ? 'HIGH' : 'MEDIUM',
    model_name: 'Demo · simulated analysis',
    prompt_version: 'v1.0',
    created_at,
    data_gaps: [
      'Source-of-funds documents are not available.',
      'Beneficial ownership of the counterparty is unverified.',
    ],
    edge_cases_or_contradictions: [
      high
        ? 'A verified KYC profile does not establish the legitimacy of this individual payment.'
        : 'Limited transaction history may not represent normal activity.',
    ],
  }
}
const investigations = transactions
  .filter((t) => t.risk_level !== 'LOW')
  .slice(0, 6)
  .map((t, i) => buildDemoReport(t, 2041 - i, date(12 - Math.floor(i / 3), 10, 20 - i)))
export const seed: Dataset = {
  customers,
  transactions,
  investigations,
  alerts: transactions
    .filter((t) => t.risk_level !== 'LOW')
    .slice(0, 10)
    .map((t, i) => ({
      id: 3201 + i,
      transaction_id: t.id,
      customer_id: t.customer_id,
      rule_name: t.risk_signals?.[0] ?? 'Activity deviation',
      description: `${t.counterparty_name} · Activity requires analyst review against the expected customer profile.`,
      severity: t.risk_level ?? 'MEDIUM',
      status: i > 7 ? 'CLOSED' : i > 4 ? 'IN_REVIEW' : 'OPEN',
      created_at: t.occurred_at,
    })),
  cases: investigations
    .slice(0, 5)
    .map((r, i) => ({
      id: 1208 - i,
      title: [
        'Unusual cross-border activity',
        'Repeated transfers to new beneficiary',
        'Source of funds review',
        'Payment purpose verification',
        'Counterparty due diligence',
      ][i],
      customer_id: r.customer_id,
      report_id: r.id,
      status: (['OPEN', 'IN_REVIEW', 'ESCALATED', 'OPEN', 'CLOSED'] as const)[i],
      priority: r.risk_level,
      assignee: ['Alex Morgan', 'Jamie Lee', 'Alex Morgan', 'Sam Patel', 'Jamie Lee'][i],
      created_at: r.created_at,
      notes: [
        {
          id: `note-${i}`,
          actor: 'Alex Morgan',
          body: 'Initial evidence collected. Investigation report attached for review.',
          created_at: r.created_at,
        },
      ],
    })),
  auditLogs: [
    {
      id: 'audit-1',
      actor: 'Alex Morgan',
      action: 'Generated investigation report',
      resource: 'RPT-2041',
      created_at: date(12, 11, 18),
    },
    {
      id: 'audit-2',
      actor: 'Jamie Lee',
      action: 'Changed case status to In review',
      resource: 'CASE-1207',
      created_at: date(12, 10, 54),
    },
    {
      id: 'audit-3',
      actor: 'Alex Morgan',
      action: 'Added evidence note',
      resource: 'CASE-1208',
      created_at: date(12, 10, 42),
    },
    {
      id: 'audit-4',
      actor: 'Sam Patel',
      action: 'Resolved alert',
      resource: 'ALT-3209',
      created_at: date(12, 10, 15),
    },
    {
      id: 'audit-5',
      actor: 'Jamie Lee',
      action: 'Completed case review',
      resource: 'CASE-1204',
      created_at: date(12, 9, 32),
    },
    {
      id: 'audit-6',
      actor: 'Alex Morgan',
      action: 'Signed in',
      resource: 'Analyst workspace',
      created_at: date(12, 9, 0),
    },
  ],
}
