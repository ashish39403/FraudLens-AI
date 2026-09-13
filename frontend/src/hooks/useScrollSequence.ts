import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Scroll-controlled playback of the supplied FraudLens sequence, with bounded decoding. */
export function useScrollSequence(
  sectionRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
) {
  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: false })
    if (!section || !canvas || !context) return

    const media = gsap.matchMedia()
    media.add(
      {
        mobile: '(max-width: 700px)',
        desktop: '(min-width: 701px)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      (match) => {
        // The responsive poster stays visible when animation is disabled or frames fail.
        if (match.conditions?.reduce) return
        const mobile = Boolean(match.conditions?.mobile)
        const frameCount = mobile ? 110 : 220
        const maxCache = mobile ? 18 : 32
        const cache = new Map<number, HTMLImageElement>()
        const failed = new Set<number>()
        const inFlight = new Map<number, HTMLImageElement>()
        const state = { frame: 1 }
        let queue: number[] = []
        let disposed = false
        let animationFrame = 0
        let lastDrawn = -1
        let visible = true
        const targetFrame = () => Math.min(frameCount, Math.max(1, Math.round(state.frame)))

        function paint() {
          animationFrame = 0
          if (disposed || !visible || document.hidden) return
          const target = targetFrame()
          const nearest = cache.has(target)
            ? target
            : [...cache.keys()].sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0]
          if (nearest === undefined || nearest === lastDrawn) return
          const image = cache.get(nearest)!
          const scale = Math.max(
            canvas!.width / image.naturalWidth,
            canvas!.height / image.naturalHeight,
          )
          const width = canvas!.width / scale
          const height = canvas!.height / scale
          context!.drawImage(
            image,
            (image.naturalWidth - width) * 0.58,
            (image.naturalHeight - height) * 0.5,
            width,
            height,
            0,
            0,
            canvas!.width,
            canvas!.height,
          )
          lastDrawn = nearest
          canvas!.dataset.frame = String(nearest)
          canvas!.dataset.ready = 'true'
        }
        function schedulePaint() {
          if (!animationFrame && !disposed) animationFrame = requestAnimationFrame(paint)
        }
        function trimCache() {
          const target = targetFrame()
          const furthest = [...cache.keys()].sort(
            (a, b) => Math.abs(b - target) - Math.abs(a - target),
          )
          for (const index of furthest.slice(0, Math.max(0, cache.size - maxCache)))
            cache.delete(index)
        }
        function pump() {
          if (disposed || !visible || document.hidden) return
          while (inFlight.size < 3 && queue.length) {
            const index = queue.shift()!
            if (cache.has(index) || inFlight.has(index) || failed.has(index)) continue
            const image = new Image()
            image.decoding = 'async'
            inFlight.set(index, image)
            image.onload = () => {
              if (disposed) return
              inFlight.delete(index)
              cache.set(index, image)
              trimCache()
              // Always paint the CURRENT target, never an obsolete asynchronous request.
              schedulePaint()
              pump()
            }
            image.onerror = () => {
              inFlight.delete(index)
              failed.add(index)
              if (!disposed) pump()
            }
            image.src = `/landing/sequence/${mobile ? 'mobile' : 'desktop'}/frame-${String(index).padStart(3, '0')}.webp`
          }
        }
        function requestNearby() {
          const target = targetFrame()
          queue = [target]
          for (let offset = 1; offset <= (mobile ? 6 : 10); offset++) {
            if (target + offset <= frameCount) queue.push(target + offset)
            if (target - offset >= 1) queue.push(target - offset)
          }
          schedulePaint()
          pump()
        }
        function resize() {
          const bounds = canvas!.getBoundingClientRect()
          const ratio = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5)
          canvas!.width = Math.max(1, Math.round(bounds.width * ratio))
          canvas!.height = Math.max(1, Math.round(bounds.height * ratio))
          lastDrawn = -1
          schedulePaint()
        }
        const resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(canvas)
        const intersection = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting
          if (visible) requestNearby()
        })
        intersection.observe(section)
        const onVisibility = () => {
          if (!document.hidden) requestNearby()
        }
        document.addEventListener('visibilitychange', onVisibility)
        resize()
        requestNearby()
        const tween = gsap.to(state, {
          frame: frameCount,
          ease: 'none',
          onUpdate: requestNearby,
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.45,
            onUpdate: (self) =>
              section.style.setProperty('--sequence-progress', String(self.progress)),
          },
        })
        return () => {
          disposed = true
          tween.scrollTrigger?.kill()
          tween.kill()
          resizeObserver.disconnect()
          intersection.disconnect()
          document.removeEventListener('visibilitychange', onVisibility)
          cancelAnimationFrame(animationFrame)
          inFlight.forEach((image) => {
            image.onload = null
            image.onerror = null
            image.src = ''
          })
          inFlight.clear()
          cache.clear()
          queue = []
          delete canvas.dataset.ready
          delete canvas.dataset.frame
          section.style.removeProperty('--sequence-progress')
        }
      },
    )
    return () => media.revert()
  }, [sectionRef, canvasRef])
}
