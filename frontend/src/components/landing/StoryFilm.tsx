import { useEffect, useRef, useState } from 'react'
import { useStoryMotion } from '../../hooks/useStoryMotion'
import { Pause, Play } from 'lucide-react'

export function StoryFilm() {
  const section = useRef<HTMLDivElement>(null)
  useStoryMotion(section)
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const userPaused = useRef(false)
  useEffect(() => {
    const element = video.current
    if (!element) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    let disposed = false
    const sync = () => {
      if (visible && !document.hidden && !reduced.matches && !userPaused.current) {
        element.src ||= '/landing/story.mp4'
        void element
          .play()
          .then(() => {
            if (disposed) element.pause()
          })
          .catch(() => {
            /* Poster remains available when playback is blocked. */
          })
      } else element.pause()
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        sync()
      },
      { threshold: 0.15 },
    )
    observer.observe(element)
    reduced.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      disposed = true
      observer.disconnect()
      reduced.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      element.pause()
      element.removeAttribute('src')
      element.load()
    }
  }, [])
  const toggle = () => {
    const element = video.current
    if (!element) return
    userPaused.current = !element.paused
    if (element.paused) {
      element.src ||= '/landing/story.mp4'
      void element.play().catch(() => {})
    } else element.pause()
  }
  return (
    <div ref={section} className="fl-film-section">
      <div data-scroll-reveal className="fl-film-intro fl-container">
        <p className="fl-eyebrow">THE CONNECTED VIEW</p>
        <p>Every signal has a wider story.</p>
        <span>See how customer context, evidence, and analyst judgment come together.</span>
      </div>
      <section className="fl-film" aria-labelledby="fl-film-title">
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          poster="/landing/sequence/desktop/frame-170.webp"
          aria-hidden="true"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <div className="fl-film-shade" />
        <div className="fl-container fl-film-content">
          <p className="fl-eyebrow">THE FULL PICTURE CHANGES EVERYTHING</p>
          <h2 id="fl-film-title">
            Follow the signal.
            <br />
            <span>Find the story.</span>
          </h2>
          <p>
            A transaction is a starting point. The customer, the counterparty, and the evidence
            bring it into focus.
          </p>
        </div>
        <button
          className="fl-film-control"
          onClick={toggle}
          aria-label={playing ? 'Pause background film' : 'Play background film'}
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
          <span>{playing ? 'Pause motion' : 'Play motion'}</span>
        </button>
      </section>
    </div>
  )
}
