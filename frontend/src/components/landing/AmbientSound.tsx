import { useEffect } from 'react'
import { AmbientAudio } from '../../lib/ambientAudio'

/** Public-site ambience; browser autoplay restrictions fall back to the first gesture. */
export function AmbientSound() {
  useEffect(() => {
    const ambient = new AmbientAudio()
    let active = true
    const removeUnlock = () => {
      document.removeEventListener('click', start)
      document.removeEventListener('keydown', start)
    }
    const start = () => {
      if (!active) return
      void ambient
        .start(() => {
          if (active) removeUnlock()
        })
        .catch(() => {})
    }
    const visibility = () => {
      void (document.hidden ? ambient.hide() : ambient.show()).catch(() => {})
    }
    document.addEventListener('click', start)
    document.addEventListener('keydown', start)
    document.addEventListener('visibilitychange', visibility)
    start()
    return () => {
      active = false
      removeUnlock()
      document.removeEventListener('visibilitychange', visibility)
      ambient.dispose()
    }
  }, [])
  return null
}
