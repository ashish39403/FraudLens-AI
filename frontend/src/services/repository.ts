import { buildDemoReport, DEMO_EMAIL, DEMO_PASSWORD, seed } from '../data/seed'
import type { AlertStatus, CaseStatus, Dataset, Investigation, Session, User } from '../types'
import { isDemo, request } from './client'

const STORAGE_KEY = 'fraudlens.demo.v1'
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))
let memory: Dataset | null = null
function readDemo(): Dataset {
  if (memory) return structuredClone(memory)
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed: Dataset = JSON.parse(saved)
      if (Object.keys(seed).every((key) => Array.isArray(parsed[key as keyof Dataset]))) {
        memory = parsed
        return structuredClone(parsed)
      }
    }
  } catch {
    /* Storage is optional; the in-memory demo remains available. */
  }
  memory = structuredClone(seed)
  return structuredClone(memory)
}
function save(data: Dataset) {
  memory = structuredClone(data)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* Fall back to memory when browser storage is unavailable. */
  }
}
function audit(data: Dataset, actor: string, action: string, resource: string) {
  data.auditLogs.unshift({
    id: crypto.randomUUID(),
    actor,
    action,
    resource,
    created_at: new Date().toISOString(),
  })
}
function requireDemo() {
  if (!isDemo)
    throw new Error(
      'This workflow is not available in the backend yet. Use demo mode to explore it.',
    )
}
export const repository = {
  async login(email: string, password: string): Promise<Session> {
    if (!isDemo) {
      const auth = await request<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      const user = await request<User>('/auth/me', {
        headers: { Authorization: `Bearer ${auth.access_token}` },
      })
      return { user, access_token: auth.access_token }
    }
    await delay(600)
    if (email.toLowerCase().trim() !== DEMO_EMAIL || password !== DEMO_PASSWORD)
      throw new Error('Email or password is incorrect. Use the demo credentials below.')
    const user = { id: 1, full_name: 'Alex Morgan', email: DEMO_EMAIL, role: 'ANALYST' }
    const data = readDemo()
    audit(data, user.full_name, 'Signed in', 'Analyst workspace')
    save(data)
    return { user, access_token: 'local-demo-session' }
  },
  async load(signal?: AbortSignal): Promise<Dataset> {
    if (isDemo) {
      await delay()
      return readDemo()
    }
    const [customers, transactions] = await Promise.all([
      request<Dataset['customers']>('/customers', { signal }),
      request<Dataset['transactions']>('/transactions', { signal }),
    ])
    // Report listing, alerts, cases and audit endpoints are not implemented in the backend yet.
    return {
      customers,
      transactions: transactions.map((t) => ({ ...t, amount: String(t.amount) })),
      investigations: [],
      alerts: [],
      cases: [],
      auditLogs: [],
    }
  },
  async investigate(transactionId: number, actor: string): Promise<Investigation> {
    if (!isDemo) return request(`/ai/investigate/transactions/${transactionId}`, { method: 'POST' })
    await delay(1200)
    const data = readDemo()
    const transaction = data.transactions.find((t) => t.id === transactionId)
    if (!transaction) throw new Error('Transaction not found.')
    const report = buildDemoReport(
      transaction,
      Math.max(2041, ...data.investigations.map((r) => r.id)) + 1,
      new Date().toISOString(),
    )
    data.investigations.unshift(report)
    audit(data, actor, 'Generated investigation report', `RPT-${report.id}`)
    save(data)
    return report
  },
  async updateAlert(id: number, status: AlertStatus, actor: string) {
    requireDemo()
    await delay()
    const data = readDemo()
    const alert = data.alerts.find((a) => a.id === id)
    if (!alert) throw new Error('Alert not found.')
    alert.status = status
    audit(
      data,
      actor,
      `Changed alert status to ${status.toLowerCase().replaceAll('_', ' ')}`,
      `ALT-${id}`,
    )
    save(data)
  },
  async updateCase(id: number, status: CaseStatus, actor: string) {
    requireDemo()
    await delay()
    const data = readDemo()
    const item = data.cases.find((c) => c.id === id)
    if (!item) throw new Error('Case not found.')
    item.status = status
    item.notes.unshift({
      id: crypto.randomUUID(),
      actor,
      body: `Status changed to ${status.toLowerCase().replaceAll('_', ' ')}.`,
      created_at: new Date().toISOString(),
    })
    audit(
      data,
      actor,
      `Changed case status to ${status.toLowerCase().replaceAll('_', ' ')}`,
      `CASE-${id}`,
    )
    save(data)
  },
  async addNote(id: number, body: string, actor: string) {
    requireDemo()
    if (!body.trim()) throw new Error('Enter a note before saving.')
    await delay()
    const data = readDemo()
    const item = data.cases.find((c) => c.id === id)
    if (!item) throw new Error('Case not found.')
    item.notes.unshift({
      id: crypto.randomUUID(),
      actor,
      body: body.trim(),
      created_at: new Date().toISOString(),
    })
    audit(data, actor, 'Added evidence note', `CASE-${id}`)
    save(data)
  },
  async createCase(reportId: number, actor: string) {
    requireDemo()
    await delay()
    const data = readDemo()
    const existing = data.cases.find((c) => c.report_id === reportId)
    if (existing) return existing.id
    const report = data.investigations.find((r) => r.id === reportId)
    if (!report) throw new Error('Report not found.')
    const id = Math.max(1208, ...data.cases.map((c) => c.id)) + 1
    data.cases.unshift({
      id,
      title: `Transaction ${report.transaction_id} review`,
      customer_id: report.customer_id,
      report_id: reportId,
      status: 'OPEN',
      priority: report.risk_level,
      assignee: actor,
      created_at: new Date().toISOString(),
      notes: [
        {
          id: crypto.randomUUID(),
          actor,
          body: `Case opened with report RPT-${reportId} attached as evidence.`,
          created_at: new Date().toISOString(),
        },
      ],
    })
    audit(data, actor, 'Opened investigation case', `CASE-${id}`)
    save(data)
    return id
  },
}
