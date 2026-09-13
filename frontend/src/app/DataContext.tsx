import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { repository } from '../services/repository'
import { errorMessage } from '../lib/format'
import type { Dataset, Investigation } from '../types'

const DataContext = createContext<{
  data: Dataset | null
  loading: boolean
  error: string
  refresh: () => Promise<void>
  addReport: (report: Investigation) => void
} | null>(null)
export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Dataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => {
    setError('')
    try {
      const next = await repository.load()
      setData((previous) => ({
        ...next,
        investigations: [
          ...next.investigations,
          ...(previous?.investigations.filter(
            (r) => !next.investigations.some((n) => n.id === r.id),
          ) ?? []),
        ],
      }))
    } catch (e) {
      setError(errorMessage(e))
      throw e
    }
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    repository
      .load(controller.signal)
      .then((next) => {
        if (!controller.signal.aborted) setData(next)
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(errorMessage(e))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])
  const addReport = (report: Investigation) =>
    setData((previous) =>
      previous
        ? {
            ...previous,
            investigations: [report, ...previous.investigations.filter((r) => r.id !== report.id)],
          }
        : previous,
    )
  return (
    <DataContext.Provider value={{ data, loading, error, refresh, addReport }}>
      {children}
    </DataContext.Provider>
  )
}
export function useData() {
  const value = useContext(DataContext)
  if (!value) throw new Error('DataProvider is required.')
  return value
}
