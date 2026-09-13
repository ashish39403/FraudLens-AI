export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type AlertStatus = 'NEW' | 'IN_REVIEW' | 'RESOLVED'
export type CaseStatus = 'OPEN' | 'IN_REVIEW' | 'ESCALATED' | 'CLOSED'
export interface Customer {
  id: number
  external_customer_id: string
  full_name: string
  customer_type: 'INDIVIDUAL' | 'BUSINESS'
  country: string
  kyc_status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  risk_level: RiskLevel
  created_at: string
  updated_at: string
}
export interface Transaction {
  id: number
  customer_id: number
  counterparty_name: string
  counterparty_account: string
  direction: 'INBOUND' | 'OUTBOUND'
  amount: string
  currency: string
  transaction_type: 'TRANSFER' | 'CARD' | 'CASH' | 'UPI' | 'WIRE'
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  occurred_at: string
  created_at: string
  risk_level?: RiskLevel
  risk_signals?: string[]
}
export interface Investigation {
  id: number
  transaction_id: number
  customer_id: number
  created_by_user_id: number | null
  risk_level: RiskLevel
  risk_score: number
  summary: string
  suspicious_patterns: string[]
  evidence: string[]
  recommended_action: string
  confidence: RiskLevel
  model_name: string
  prompt_version: string
  created_at: string
  data_gaps?: string[]
  edge_cases_or_contradictions?: string[]
}
export interface Alert {
  id: number
  transaction_id: number
  customer_id: number
  rule_name: string
  description: string
  severity: RiskLevel
  status: AlertStatus
  created_at: string
}
export interface CaseNote {
  id: string
  actor: string
  body: string
  created_at: string
}
export interface Case {
  id: number
  title: string
  customer_id: number
  report_id: number
  status: CaseStatus
  priority: RiskLevel
  assignee: string
  created_at: string
  notes: CaseNote[]
}
export interface AuditLog {
  id: string
  actor: string
  action: string
  resource: string
  created_at: string
}
export interface Dataset {
  customers: Customer[]
  transactions: Transaction[]
  investigations: Investigation[]
  alerts: Alert[]
  cases: Case[]
  auditLogs: AuditLog[]
}
export interface User {
  id: number
  full_name: string
  email: string
  role: string
}
export interface Session {
  user: User
  access_token: string
}
