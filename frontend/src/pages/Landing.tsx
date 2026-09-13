import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Brand } from '../components/ui'
import { SequenceHero } from '../components/landing/SequenceHero'
import { ProductStory, AnalystPrinciples } from '../components/landing/ProductStory'
import { StoryFilm } from '../components/landing/StoryFilm'
import { AmbientSound } from '../components/landing/AmbientSound'
import { useSectionReveal } from '../hooks/useSectionReveal'
import '@fontsource-variable/inter/wght-italic.css'
import '../components/landing/landing.css'

export default function Landing() {
  const page = useRef<HTMLDivElement>(null)
  useSectionReveal(page)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    document.title = 'FraudLens AI · See the story behind the transaction'
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [])
  return (
    <div ref={page} className="fl-landing">
      <AmbientSound />
      <a className="skip-link" href="#platform">
        Skip to product details
      </a>
      <header className="fl-header">
        <div className="fl-container fl-header-inner">
          <Link to="/" aria-label="FraudLens AI home">
            <Brand />
          </Link>
          <nav className="fl-desktop-nav" aria-label="Product navigation">
            <a href="#platform">The platform</a>
            <a href="#workflow">How it works</a>
            <a href="#intelligence">Our approach</a>
          </nav>
          <div className="fl-header-actions">
            <Link className="btn btn-primary" to="/app/dashboard">
              Open workspace <ArrowUpRight size={15} />
            </Link>
            <button
              className="fl-menu-toggle"
              aria-label={menuOpen ? 'Close product navigation' : 'Open product navigation'}
              aria-expanded={menuOpen}
              aria-controls="fl-mobile-nav"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        <nav
          id="fl-mobile-nav"
          className="fl-mobile-nav"
          aria-label="Mobile product navigation"
          hidden={!menuOpen}
        >
          <a href="#platform" onClick={() => setMenuOpen(false)}>
            The platform
          </a>
          <a href="#workflow" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a href="#intelligence" onClick={() => setMenuOpen(false)}>
            Our approach
          </a>
        </nav>
      </header>
      <main>
        <SequenceHero />
        <div data-scroll-reveal className="fl-context-bar fl-container">
          <span>BUILT AROUND YOUR INVESTIGATION</span>
          <p>
            Customer context <i /> Transaction evidence <i /> Analyst control
          </p>
        </div>
        <ProductStory />
        <StoryFilm />
        <AnalystPrinciples />
      </main>
      <footer className="fl-footer fl-container">
        <div>
          <Link to="/" aria-label="FraudLens AI home">
            <Brand />
          </Link>
          <p>Financial crime intelligence, in focus.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#platform">Platform</a>
          <a href="#workflow">Workflow</a>
          <Link to="/app/dashboard">
            Workspace <ArrowUpRight size={13} />
          </Link>
        </nav>
        <small>© {new Date().getFullYear()} FraudLens AI</small>
      </footer>
    </div>
  )
}
