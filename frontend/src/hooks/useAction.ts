import { useState } from 'react'
import { errorMessage } from '../lib/format'
export function useAction() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  async function run(action: () => Promise<void>, message = '') {
    if (pending) return
    setPending(true)
    setError('')
    setSuccess('')
    try {
      await action()
      setSuccess(message)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setPending(false)
    }
  }
  return { pending, error, success, run }
}
