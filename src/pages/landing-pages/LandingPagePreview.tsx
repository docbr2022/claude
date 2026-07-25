import { useState } from 'react'
import { Copy, Check, Sparkles, Rocket, ShieldCheck, Zap, Quote } from 'lucide-react'
import type { LandingPage } from '@/types/database'

interface LPContent {
  kicker?: string
  headline: string
  subheadline: string
  cta_text: string
  benefits: { title: string; description: string }[]
  testimonial: { quote: string; author: string }
  faq: { question: string; answer: string }[]
  closing_headline?: string
}

const BENEFIT_ICONS = [Sparkles, Rocket, ShieldCheck, Zap]

// Ícones simples em SVG inline (sem dependência externa) para o HTML exportável.
const STATIC_ICONS = [
  '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>',
  '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
  '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
]

function slugishInitial(author: string) {
  return author.trim().charAt(0).toUpperCase() || '?'
}

function buildStaticHtml(page: LandingPage) {
  const c = page.content as unknown as LPContent

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>${page.name}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  :root {
    --yellow: #D9B607; --gold: #A78C09; --black: #000000; --ink: #111111;
    --gray-700: #3a3a3a; --gray-500: #6b6b6b; --gray-100: #f3f2ec; --border: #e6e3d8;
    --radius-lg: 20px; --radius-md: 12px; --radius-pill: 999px;
    --shadow-card: 0 10px 30px rgba(0,0,0,.08);
    --shadow-card-hover: 0 16px 40px rgba(0,0,0,.14);
    --shadow-btn: 0 6px 18px rgba(217,182,7,.35);
  }
  * { box-sizing: border-box; }
  body { font-family: 'Poppins', sans-serif; margin: 0; color: var(--gray-700); background: #fff; }
  h1, h2, h3 { font-family: 'Baloo 2', sans-serif; color: var(--ink); margin: 0; }
  .wrap { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
  .kicker { display: inline-block; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: .16em; padding: 6px 16px; border-radius: var(--radius-pill); }
  .btn { display: inline-flex; align-items: center; gap: 8px; background: var(--yellow); color: var(--black); font-weight: 700; padding: 14px 36px; border-radius: var(--radius-pill); text-decoration: none; box-shadow: var(--shadow-btn); border: none; font-size: 15px; }
  .hero { background: var(--black); color: #fff; text-align: center; padding: 96px 24px 88px; }
  .hero .kicker { background: rgba(255,255,255,.1); color: #FFE400; margin-bottom: 20px; }
  .hero h1 { color: #fff; font-size: 44px; line-height: 1.15; font-weight: 800; max-width: 780px; margin: 0 auto; }
  .hero p { font-size: 17px; line-height: 1.7; color: rgba(255,255,255,.72); max-width: 600px; margin: 20px auto 32px; }
  .benefits { background: var(--gray-100); padding: 88px 24px; }
  .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 28px; margin-top: 48px; }
  .card { background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-card); padding: 32px 28px; transition: all .25s ease; }
  .icon-box { width: 56px; height: 56px; border-radius: var(--radius-md); background: var(--yellow); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
  .card h3 { font-size: 20px; margin-bottom: 8px; }
  .card p { font-size: 14px; color: var(--gray-500); line-height: 1.6; margin: 0; }
  .section-heading { text-align: center; max-width: 640px; margin: 0 auto; }
  .section-heading .kicker { background: var(--gray-100); color: var(--gold); }
  .section-heading h2 { font-size: 32px; margin-top: 12px; }
  .testimonial { padding: 88px 24px; text-align: center; }
  .testimonial-card { max-width: 680px; margin: 0 auto; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-card); padding: 48px 40px; }
  .testimonial-card p { font-size: 19px; font-style: italic; color: var(--ink); line-height: 1.6; }
  .avatar { width: 44px; height: 44px; border-radius: 999px; background: var(--yellow); color: var(--black); font-weight: 700; font-family: 'Baloo 2', sans-serif; display: flex; align-items: center; justify-content: center; margin: 20px auto 8px; }
  .faq { background: var(--gray-100); padding: 88px 24px; }
  .faq-list { max-width: 720px; margin: 48px auto 0; display: flex; flex-direction: column; gap: 14px; }
  .faq-item { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--border); padding: 22px 26px; }
  .faq-item h4 { font-family: 'Poppins', sans-serif; font-size: 15px; font-weight: 600; color: var(--ink); margin: 0 0 6px; }
  .faq-item p { font-size: 14px; color: var(--gray-500); margin: 0; line-height: 1.6; }
  .closing { background: var(--black); color: #fff; text-align: center; padding: 88px 24px; }
  .closing h2 { color: #fff; font-size: 30px; max-width: 620px; margin: 0 auto 32px; }
</style>
</head>
<body>
  <section class="hero">
    <div class="wrap">
      ${c.kicker ? `<span class="kicker">${c.kicker}</span>` : ''}
      <h1>${c.headline}</h1>
      <p>${c.subheadline}</p>
      <a class="btn" href="#">${c.cta_text}</a>
    </div>
  </section>

  <section class="benefits">
    <div class="wrap">
      <div class="section-heading">
        <span class="kicker">O QUE OFERECEMOS</span>
        <h2>Por que escolher a gente</h2>
      </div>
      <div class="benefits-grid">
        ${c.benefits
          .map(
            (b, i) => `<div class="card">
          <div class="icon-box">${STATIC_ICONS[i % STATIC_ICONS.length]}</div>
          <h3>${b.title}</h3>
          <p>${b.description}</p>
        </div>`,
          )
          .join('\n')}
      </div>
    </div>
  </section>

  <section class="testimonial">
    <div class="wrap">
      <div class="testimonial-card">
        <p>&ldquo;${c.testimonial.quote}&rdquo;</p>
        <div class="avatar">${slugishInitial(c.testimonial.author)}</div>
        <strong>${c.testimonial.author}</strong>
      </div>
    </div>
  </section>

  <section class="faq">
    <div class="wrap">
      <div class="section-heading">
        <span class="kicker">DÚVIDAS</span>
        <h2>Perguntas frequentes</h2>
      </div>
      <div class="faq-list">
        ${c.faq.map((f) => `<div class="faq-item"><h4>${f.question}</h4><p>${f.answer}</p></div>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="closing">
    <div class="wrap">
      <h2>${c.closing_headline || 'Pronto para dar o próximo passo?'}</h2>
      <a class="btn" href="#">${c.cta_text}</a>
    </div>
  </section>
</body>
</html>`
}

export default function LandingPagePreview({ page }: { page: LandingPage }) {
  const [copied, setCopied] = useState(false)
  const c = page.content as unknown as LPContent

  function copyHtml() {
    navigator.clipboard.writeText(buildStaticHtml(page))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-100 p-4">
        <h3 className="font-display text-sm font-semibold text-ink-900">{page.name}</h3>
        <button onClick={copyHtml} className="btn-secondary !py-1.5 !px-3 text-xs">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copiado!' : 'Copiar HTML'}
        </button>
      </div>

      <div className="max-h-[640px] overflow-y-auto bg-white">
        {/* Hero */}
        <div className="bg-ink-950 px-8 py-16 text-center text-white">
          {c.kicker && (
            <span className="badge mb-5 bg-white/10 uppercase tracking-wider text-brand-300">
              {c.kicker}
            </span>
          )}
          <h2 className="font-display mx-auto max-w-xl text-3xl font-extrabold leading-tight">
            {c.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/70">{c.subheadline}</p>
          <span className="btn-primary mt-7 inline-flex">{c.cta_text}</span>
        </div>

        {/* Benefícios */}
        <div className="bg-ink-100 px-8 py-16">
          <div className="mx-auto max-w-lg text-center">
            <span className="badge bg-white uppercase tracking-wider text-brand-700">
              O QUE OFERECEMOS
            </span>
            <h3 className="font-display mt-3 text-2xl font-bold text-ink-900">
              Por que escolher a gente
            </h3>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {c.benefits?.map((b, i) => {
              const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length]
              return (
                <div
                  key={i}
                  className="card group p-7 transition-all hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[12px] bg-brand-600 text-ink-950">
                    <Icon size={24} />
                  </div>
                  <h4 className="font-display text-lg font-semibold text-ink-900">{b.title}</h4>
                  <p className="mt-1.5 text-sm text-ink-500">{b.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Depoimento */}
        <div className="px-8 py-16">
          <div className="card mx-auto max-w-lg p-10 text-center">
            <Quote className="mx-auto mb-3 text-brand-200" size={32} />
            <p className="italic text-ink-800">&ldquo;{c.testimonial?.quote}&rdquo;</p>
            <div className="mx-auto mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 font-display font-bold text-ink-950">
              {slugishInitial(c.testimonial?.author ?? '')}
            </div>
            <p className="mt-1.5 text-sm font-semibold text-ink-900">{c.testimonial?.author}</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-ink-100 px-8 py-16">
          <div className="mx-auto max-w-lg text-center">
            <span className="badge bg-white uppercase tracking-wider text-brand-700">DÚVIDAS</span>
            <h3 className="font-display mt-3 text-2xl font-bold text-ink-900">
              Perguntas frequentes
            </h3>
          </div>
          <div className="mx-auto mt-8 max-w-xl space-y-3">
            {c.faq?.map((f, i) => (
              <div key={i} className="rounded-[12px] border border-ink-200 bg-white p-5">
                <p className="text-sm font-semibold text-ink-900">{f.question}</p>
                <p className="mt-1 text-sm text-ink-500">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fechamento */}
        <div className="bg-ink-950 px-8 py-16 text-center">
          <h3 className="font-display mx-auto max-w-md text-2xl font-bold text-white">
            {c.closing_headline || 'Pronto para dar o próximo passo?'}
          </h3>
          <span className="btn-primary mt-6 inline-flex">{c.cta_text}</span>
        </div>
      </div>
    </div>
  )
}
