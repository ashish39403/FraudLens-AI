import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './ui'

export function Drawer({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement as HTMLElement | null
    dialog?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-labelledby="drawer-title"
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const focusable = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
          ),
        ).filter((element) => element.getClientRects().length > 0 && !element.closest('[hidden]'))
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const rect = e.currentTarget.getBoundingClientRect()
          if (e.clientX < rect.left) onClose()
        }
      }}
    >
      <div className="drawer-header">
        <div>
          {subtitle && <p className="eyebrow">{subtitle}</p>}
          <h2 id="drawer-title">{title}</h2>
        </div>
        <Button aria-label="Close detail panel" variant="ghost" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>
      <div className="drawer-content">{children}</div>
    </dialog>
  )
}
