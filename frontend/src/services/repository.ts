import { buildDemoReport, DEMO_EMAIL, DEMO_PASSWORD, seed } from '../data/seed'
import type {
  Alert,
  AlertStatus,
  Case,
  CaseStatus,
  Dataset,
  Investigation,
  Session,
  RegistrationInput,
  User,
} from '../types'
import { isDemo, request } from './client'
import { validateRegistration } from '../lib/auth'
import { registerDemo, loginDemoAccount } from './demoAccounts'

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

type ApiCase = {
  id: number
  alert_id: number
  transaction_id: number
  customer_id: number
  assigned_to_user_id: number | null
  title: string
  description: string
  status: CaseStatus
  priority: Case['priority']
  created_at: string
  updated_at: string
  closed_at: string | null
}

function normalizeCase(item: ApiCase, reports: Investigation[]): Case {
  const report = reports.find(
    (r) => r.transaction_id === item.transaction_id && r.customer_id === item.customer_id,
  )
  return {
    id: item.id,
    alert_id: item.alert_id,
    transaction_id: item.transaction_id,
    title: item.title,
    customer_id: item.customer_id,
    report_id: report?.id ?? 0,
    status: item.status,
    priority: item.priority,
    assignee: item.assigned_to_user_id ? `User ${item.assigned_to_user_id}` : 'Unassigned',
    created_at: item.created_at,
    updated_at: item.updated_at,
    closed_at: item.closed_at,
    notes: item.description
      ? [
          {
            id: `case-${item.id}-description`,
            actor: 'System',
            body: item.description,
            created_at: item.created_at,
          },
        ]
      : [],
  }
}

export const repository = {
  async register(input: RegistrationInput): Promise<User> {
    validateRegistration(input)
    const payload = {
      ...input,
      full_name: input.full_name.trim(),
      email: input.email.trim().toLowerCase(),
    }
    if (!isDemo)
      return request<User>('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
    await delay(500)
    return registerDemo(payload)
  },
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
    const user =
      email.toLowerCase().trim() === DEMO_EMAIL && password === DEMO_PASSWORD
        ? { id: 1, full_name: 'Alex Morgan', email: DEMO_EMAIL, role: 'ANALYST' as const }
        : await loginDemoAccount(email, password)
    if (!user)
      throw new Error(
        'Email or password is incorrect. Use your new account or the demo credentials below.',
      )
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
    const [customers, transactions, alerts, investigations, cases] = await Promise.all([
      request<Dataset['customers']>('/customers', { signal }),
      request<Dataset['transactions']>('/transactions', { signal }),
      request<Alert[]>('/alerts', { signal }),
      request<Investigation[]>('/ai/investigations', { signal }),
      request<ApiCase[]>('/cases', { signal }),
    ])
    return {
      customers,
      transactions: transactions.map((t) => ({ ...t, amount: String(t.amount) })),
      investigations,
      alerts,
      cases: cases.map((item) => normalizeCase(item, investigations)),
      auditLogs: [],
    }
  },
  async investigate(transactionId: number, actor: string): Promise<Investigation> {
    if (!isDemo)
      return request(`/ai/investigate/transactions/${transactionId}`, {
        method: 'POST',
        timeoutMs: 90000,
      })
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
    if (!isDemo) {
      await request<Alert>(`/alerts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      return
    }
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
    if (!isDemo) {
      await request<ApiCase>(`/cases/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      return
    }
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
    if (!isDemo) {
      const report = await request<Investigation>(`/ai/investigations/${reportId}`)
      const alerts = await request<Alert[]>(`/alerts?customer_id=${report.customer_id}`)
      const alert = alerts.find((item) => item.transaction_id === report.transaction_id)
      if (!alert)
        throw new Error(
          'No alert is linked to this report transaction yet. Create or trigger an alert first.',
        )
      const item = await request<ApiCase>('/cases', {
        method: 'POST',
        body: JSON.stringify({
          alert_id: alert.id,
          title: `Transaction ${report.transaction_id} review`,
          description: `Case opened from AI report RPT-${report.id}. ${report.summary}`,
          priority: report.risk_level,
          assigned_to_user_id: null,
        }),
      })
      return item.id
    }
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
