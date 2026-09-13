import { useRef } from 'react'
import { Link } from 'react-router'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { useScrollSequence } from '../../hooks/useScrollSequence'

export function SequenceHero() {
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  useScrollSequence(section, canvas)
  return (
    <section ref={section} className="fl-sequence" aria-labelledby="fl-hero-title">
      <div className="fl-hero-pin">
        <div className="fl-hero-art" aria-hidden="true">
          <picture>
            <source media="(max-width: 700px)" srcSet="/landing/sequence/mobile/frame-075.webp" />
            <img
              src="/landing/sequence/desktop/frame-150.webp"
              alt=""
              fetchPriority="high"
              width="1440"
              height="810"
            />
          </picture>
          <canvas ref={canvas} width="1440" height="810" />
        </div>
        <div className="fl-hero-shade" />
        <div className="fl-container fl-hero-content">
          <p className="fl-eyebrow">
            <span />
            FINANCIAL CRIME INTELLIGENCE
          </p>
          <h1 id="fl-hero-title" data-word-assembly="hero">
            <span className="fl-assemble-word">See</span>{' '}
            <span className="fl-assemble-word">the</span>{' '}
            <span className="fl-assemble-word">story</span>
            <br />
            <span className="fl-assemble-word">behind</span>{' '}
            <span className="fl-assemble-word">the</span>
            <br />
            <span className="fl-assemble-word fl-hero-accent">transaction.</span>
          </h1>
          <p className="fl-hero-description">
            Connect the customer, follow the money, and investigate the evidence. One focused
            workspace for fraud and AML teams.
          </p>
          <div className="fl-hero-actions">
            <Link className="btn btn-primary" to="/app/dashboard">
              Open workspace <ArrowUpRight size={17} />
            </Link>
            <a className="fl-explore" href="#platform">
              Explore the platform <ArrowDown size={15} />
            </a>
          </div>
          <p className="fl-hero-note">AI-assisted investigation. Human-led decisions.</p>
        </div>
        <div className="fl-container fl-hero-bottom">
          <span>
            <span className="fl-scroll-line" />
            SCROLL TO FOLLOW THE STORY
          </span>
          <div>
            <span>01 / TRACE</span>
            <span>02 / INVESTIGATE</span>
            <span>03 / DECIDE</span>
          </div>
        </div>
        <div className="fl-progress" aria-hidden="true" />
      </div>
    </section>
  )
}
