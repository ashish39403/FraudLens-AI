import { Fragment, useRef } from 'react'
import { useStoryMotion } from '../../hooks/useStoryMotion'
import { ArrowUpRight, Check, FileSearch, Fingerprint, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'

const steps = [
  {
    number: '01',
    title: 'Trace the context.',
    Icon: Fingerprint,
    description:
      'A payment tells only part of the story. Connect customer identity, KYC status, and transaction history to understand the activity behind the signal.',
    details: ['Customer profiles & KYC context', 'Transaction history & counterparties'],
    art: 'trace',
    caption: 'A payment becomes a pattern.',
  },
  {
    number: '02',
    title: 'Investigate the evidence.',
    Icon: FileSearch,
    description:
      'Build a reasoned assessment from the available evidence. Review AI findings, challenge conflicting signals, and make missing context visible before taking action.',
    details: ['Risk assessment & supporting evidence', 'Recommendations, gaps & contradictions'],
    art: 'investigate',
    caption: 'A signal becomes an investigation.',
    bridge: 'With the context connected, examine the evidence.',
  },
  {
    number: '03',
    title: 'Make a considered decision.',
    Icon: ShieldCheck,
    description:
      'Turn a reviewed finding into a documented next step. Bring reports, evidence, and analyst notes into one case so the rationale stays connected to the decision.',
    details: ['Connected reports & case notes', 'Analyst review & activity history'],
    art: 'decide',
    caption: 'An investigation becomes a decision.',
    bridge: 'Turn the findings into a considered next step.',
  },
]

export function ProductStory() {
  const section = useRef<HTMLElement>(null)
  useStoryMotion(section)
  return (
    <section ref={section} id="platform" className="fl-platform">
      <div data-scroll-reveal className="fl-section-heading fl-container">
        <div>
          <p className="fl-eyebrow">A CONNECTED INVESTIGATION</p>
          <h2>
            The full picture.
            <br />
            <span>In one place.</span>
          </h2>
        </div>
        <p>
          Connect the customer, the movement of money, and the reasoning behind each decision. One
          workspace for a more considered investigation.
        </p>
      </div>
      <div id="workflow" className="fl-workflow">
        {steps.map(({ number, title, Icon, description, details, art, caption, bridge }) => (
          <Fragment key={number}>
            {bridge && (
              <div data-scroll-reveal className="fl-story-bridge fl-container">
                <span aria-hidden="true" />
                <p>
                  {bridge.split(' ').map((word, index) => (
                    <Fragment key={`${index}-${word}`}>
                      <span className="fl-bridge-word">{word}</span>{' '}
                    </Fragment>
                  ))}
                </p>
                <span aria-hidden="true" />
              </div>
            )}
            <article className="fl-scene" data-chapter={art}>
              <picture className="fl-scene-art">
                <source
                  media="(max-width: 700px)"
                  srcSet={'/landing/art/' + art + '-mobile.webp'}
                />
                <img
                  loading="lazy"
                  decoding="async"
                  src={'/landing/art/' + art + '.webp'}
                  alt=""
                  width="1672"
                  height="941"
                />
              </picture>
              <div className="fl-scene-shade" />
              <div className="fl-scene-content fl-container">
                <div className="fl-scene-copy">
                  <span className="fl-scene-number">
                    {number}
                    <span />
                    {art.toUpperCase()}
                  </span>
                  <Icon size={26} className="fl-scene-icon" />
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <ul>
                    {details.map((detail) => (
                      <li key={detail}>
                        <Check size={14} />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="fl-scene-caption">
                  <span>{caption}</span>
                  <span>FRAUDLENS AI / {number}</span>
                </div>
              </div>
            </article>
          </Fragment>
        ))}
      </div>
    </section>
  )
}

export function AnalystPrinciples() {
  return (
    <section id="intelligence" className="fl-intelligence fl-container">
      <div data-scroll-reveal className="fl-section-heading">
        <div>
          <p className="fl-eyebrow">INTELLIGENCE WITH ACCOUNTABILITY</p>
          <h2>
            AI brings perspective.
            <br />
            <span>You bring judgment.</span>
          </h2>
        </div>
        <p>
          A risk score is a starting point. FraudLens keeps the supporting evidence, uncertainty,
          and recommended next steps open to analyst review.
        </p>
      </div>
      <div data-scroll-reveal className="fl-principles">
        <article>
          <span>01 / EVIDENCE</span>
          <h3>Evidence behind every finding.</h3>
          <p>
            Review the transaction details and supporting evidence behind each investigation
            summary.
          </p>
        </article>
        <article>
          <span>02 / CONTEXT</span>
          <h3>Clarity about uncertainty.</h3>
          <p>
            Consider confidence, data gaps, and conflicting signals before deciding how to proceed.
          </p>
        </article>
        <article>
          <span>03 / CONTROL</span>
          <h3>Judgment stays with you.</h3>
          <p>
            Use recommendations to guide the review. The analyst determines the next step and
            records the rationale.
          </p>
        </article>
      </div>
      <div data-scroll-reveal className="fl-closing">
        <span className="fl-closing-mark">
          <ShieldCheck size={28} />
        </span>
        <p className="fl-eyebrow">YOUR NEXT INVESTIGATION STARTS HERE</p>
        <h2>
          Bring the story
          <br />
          <em>into focus.</em>
        </h2>
        <p>Trace the activity. Assess the evidence. Document your decision.</p>
        <Link className="btn btn-primary" to="/app/dashboard">
          Open workspace <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  )
}
