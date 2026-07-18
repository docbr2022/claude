import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { LandingPage } from '@/types/database'

interface LPContent {
  headline: string
  subheadline: string
  cta_text: string
  benefits: { title: string; description: string }[]
  testimonial: { quote: string; author: string }
  faq: { question: string; answer: string }[]
}

function buildStaticHtml(page: LandingPage) {
  const c = page.content as unknown as LPContent
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>${page.name}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body { font-family: system-ui, sans-serif; margin: 0; color: #1a1a1a; }
  .hero { padding: 80px 24px; text-align: center; background: linear-gradient(135deg,#3563f5,#1e34d1); color: white; }
  .hero h1 { font-size: 2.5rem; margin-bottom: 12px; }
  .hero p { font-size: 1.1rem; opacity: 0.9; max-width: 600px; margin: 0 auto 28px; }
  .btn { background: white; color: #1e34d1; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; }
  .benefits { display: grid; grid-template-columns: repeat(auto-fit,minmax(240px,1fr)); gap: 24px; padding: 64px 24px; max-width: 1000px; margin: 0 auto; }
  .benefit h3 { margin-bottom: 8px; }
  .testimonial { background: #f6f7f9; padding: 64px 24px; text-align: center; }
  .testimonial blockquote { font-size: 1.25rem; font-style: italic; max-width: 700px; margin: 0 auto 16px; }
  .faq { padding: 64px 24px; max-width: 700px; margin: 0 auto; }
  .faq-item { border-bottom: 1px solid #eee; padding: 20px 0; }
  .faq-item h4 { margin: 0 0 8px; }
</style>
</head>
<body>
  <section class="hero">
    <h1>${c.headline}</h1>
    <p>${c.subheadline}</p>
    <a class="btn" href="#">${c.cta_text}</a>
  </section>
  <section class="benefits">
    ${c.benefits.map((b) => `<div class="benefit"><h3>${b.title}</h3><p>${b.description}</p></div>`).join('\n')}
  </section>
  <section class="testimonial">
    <blockquote>"${c.testimonial.quote}"</blockquote>
    <p><strong>${c.testimonial.author}</strong></p>
  </section>
  <section class="faq">
    <h2>Perguntas frequentes</h2>
    ${c.faq.map((f) => `<div class="faq-item"><h4>${f.question}</h4><p>${f.answer}</p></div>`).join('\n')}
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
        <h3 className="text-sm font-semibold text-ink-900">{page.name}</h3>
        <button onClick={copyHtml} className="btn-secondary !py-1.5 !px-3 text-xs">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copiado!' : 'Copiar HTML'}
        </button>
      </div>
      <div className="max-h-[560px] overflow-y-auto">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-10 text-center text-ink-950">
          <h2 className="font-display text-2xl font-bold">{c.headline}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-900/80">{c.subheadline}</p>
          <span className="mt-5 inline-block rounded-full bg-ink-950 px-6 py-2.5 text-sm font-semibold text-brand-600">
            {c.cta_text}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
          {c.benefits?.map((b, i) => (
            <div key={i}>
              <h4 className="text-sm font-semibold text-ink-900">{b.title}</h4>
              <p className="mt-1 text-xs text-ink-500">{b.description}</p>
            </div>
          ))}
        </div>
        <div className="bg-ink-50 p-6 text-center">
          <p className="italic text-ink-700">"{c.testimonial?.quote}"</p>
          <p className="mt-2 text-xs font-medium text-ink-500">{c.testimonial?.author}</p>
        </div>
        <div className="space-y-3 p-6">
          {c.faq?.map((f, i) => (
            <div key={i} className="border-b border-ink-100 pb-3">
              <p className="text-sm font-medium text-ink-900">{f.question}</p>
              <p className="mt-1 text-xs text-ink-500">{f.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
