import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
export function useStoryMotion(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!ref.current) return
    const section = ref.current
    const media = gsap.matchMedia()
    media.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        section.querySelectorAll<HTMLElement>('.fl-scene, .fl-film').forEach((scene) => {
          const art = scene.querySelector('.fl-scene-art, video')
          const chapter = scene.dataset.chapter
          // Follow the network, settle the lens into focus, then align the case layers.
          const from =
            chapter === 'trace'
              ? { xPercent: -1, yPercent: -2, scale: 1.06 }
              : chapter === 'investigate'
                ? { xPercent: 0, yPercent: 0, scale: 1.1 }
                : { xPercent: 0, yPercent: 2, scale: 1.04 }
          gsap.fromTo(art, from, {
            xPercent: chapter === 'trace' ? 1 : 0,
            yPercent: chapter === 'trace' ? 2 : -1,
            scale: chapter === 'trace' ? 1.06 : 1.02,
            ease: 'none',
            scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
          })
          gsap.fromTo(
            scene.querySelectorAll('.fl-scene-copy > *, .fl-film-content > *'),
            { y: 18, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              stagger: 0.09,
              ease: 'power2.out',
              scrollTrigger: { trigger: scene, start: 'top 78%', once: true },
            },
          )
        })
      },
      section,
    )
    return () => media.revert()
  }, [ref])
}
