import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Scroll-linked word assembly and section reveals; reduced motion keeps text static. */
export function useSectionReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!ref.current) return
    const root = ref.current
    const media = gsap.matchMedia()
    media.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        root.querySelectorAll<HTMLElement>('[data-scroll-reveal]').forEach((section) => {
          if (section.classList.contains('fl-story-bridge')) return
          const cards = section.querySelectorAll('.fl-principles article')
          gsap.fromTo(
            cards.length ? cards : section,
            { y: 26, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              stagger: 0.12,
              ease: 'power2.out',
              scrollTrigger: { trigger: section, start: 'top 90%', once: true },
            },
          )
        })
      },
      root,
    )
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const bridges = [
      ...root.querySelectorAll<HTMLElement>('.fl-story-bridge, [data-word-assembly]'),
    ].map((section) => ({
      section,
      words: [...section.querySelectorAll<HTMLElement>('.fl-bridge-word, .fl-assemble-word')],
      lines: [...section.querySelectorAll<HTMLElement>(':scope > span[aria-hidden]')],
    }))
    let frame = 0
    const resetWords = () =>
      bridges.forEach(({ words, lines }) =>
        [...words, ...lines].forEach((el) => {
          el.style.removeProperty('transform')
          el.style.removeProperty('opacity')
        }),
      )
    const paint = () => {
      frame = 0
      if (reduced.matches) {
        resetWords()
        return
      }
      const height = window.innerHeight
      bridges.forEach(({ section, words, lines }) => {
        const hero = section.dataset.wordAssembly === 'hero'
        const bounds = (hero ? section.closest('.fl-sequence')! : section).getBoundingClientRect()
        const progress = Math.max(
          0,
          Math.min(
            1,
            hero
              ? ((root.querySelector('.fl-header')?.clientHeight ?? 78) - bounds.top) /
                  Math.min(420, height * 0.5)
              : (height * 0.92 - bounds.top) / (height * 0.34 + bounds.height / 2),
          ),
        )
        words.forEach((word, index) => {
          const offset = index - (words.length - 1) / 2
          const delay = Math.abs(offset) * 0.015
          const phase = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)))
          const remaining = Math.pow(1 - phase, 3)
          const x = offset * (window.innerWidth <= 700 ? 5 : 12) * remaining
          const y = (index % 2 ? 1 : -1) * (hero ? 10 : 16) * remaining
          word.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'
          word.style.opacity = String(1 - (hero ? 0.35 : 0.92) * remaining)
        })
        lines.forEach((line) => {
          line.style.transform = 'scaleX(' + progress + ')'
          line.style.opacity = String(progress)
        })
      })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    reduced.addEventListener('change', schedule)
    schedule()
    return () => {
      media.revert()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      reduced.removeEventListener('change', schedule)
      resetWords()
    }
  }, [ref])
}
