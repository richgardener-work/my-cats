import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import HeroVideo from '../components/HeroVideo'
import PolaroidDeck from '../components/PolaroidDeck'
import FeaturedCats from '../components/FeaturedCats'
import FloatingPaws from '../components/decor/FloatingPaws'
import PaperNoise from '../components/decor/PaperNoise'
import { useAuth } from '../hooks/useAuth'
import { usePhotos } from '../hooks/usePhotos'

export default function HomePage() {
  const { isAuthorized } = useAuth()
  const { photos } = usePhotos()

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ minHeight: 'calc(100dvh - 80px)' }}>
        <HeroVideo/>
        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-24 md:grid-cols-2">
          <div className="max-w-xl text-white">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] opacity-80">
              <span className="inline-block h-1.5 w-1.5 animate-eyebrow-dot rounded-full motion-reduce:animate-none" style={{ background: '#E879B4' }}/>
              Private Collection
            </div>
            <Headline text={['Keep every', 'soft moment.']}/>
            <p className="mt-6 max-w-md text-base opacity-80">
              A shared album for the quiet days we collect.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/gallery"
                    className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #E879B4, #C9A0DC)', boxShadow: '0 10px 30px rgba(232,121,180,0.4)' }}>
                Explore Gallery <ArrowRight size={16} className="transition group-hover:translate-x-1"/>
              </Link>
              <Link to="/games"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm backdrop-blur-md hover:-translate-y-0.5 transition text-white">
                <Play size={14}/> Play a puzzle
              </Link>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <PolaroidDeck photos={photos}/>
          </div>
        </div>
      </section>

      {/* HOW WE COLLECT THEM */}
      <section className="relative overflow-hidden bg-light-base dark:bg-dark-base py-24">
        <PaperNoise opacity={0.08}/>
        <FloatingPaws count={3}/>
        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <h2 className="font-display font-wonky text-4xl md:text-5xl">How we collect them</h2>
          <div className="mt-10 space-y-6">
            <StepRow n="01" title="Gather" copy="Drop a photo — the day it was taken, the cat in frame, a note if you feel like it."/>
            <StepRow n="02" title="Choose" copy="Pick a tile size — three, four, or five across — and we slice the photo for you."/>
            <StepRow n="03" title="Keep" copy="Solve it and the stars settle into your profile. The photo stays in the gallery."/>
          </div>
        </div>
      </section>

      {/* FEATURED CATS */}
      {isAuthorized && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display font-wonky text-3xl mb-6">The family</h2>
          <FeaturedCats/>
        </section>
      )}
    </div>
  )
}

function Headline({ text }) {
  const lines = text
  return (
    <h1 className="mt-6 font-display font-wonky leading-[1.05] tracking-tight text-5xl md:text-7xl">
      {lines.map((line, li) => (
        <div key={li} className="block">
          {line.split(' ').map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3 + (li * line.split(' ').length + i) * 0.05 } }}
              className={`inline-block ${li === 1 ? 'font-hand-accent text-[0.95em] text-[#E879B4]' : ''}`}
              style={li === 1 ? { marginRight: 12 } : { marginRight: 12 }}
            >
              {w}
            </motion.span>
          ))}
        </div>
      ))}
    </h1>
  )
}

function StepRow({ n, title, copy }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      whileHover={{ y: -4 }}
      className="group grid grid-cols-[80px_1fr] items-start gap-6 border-t border-black/10 dark:border-white/10 pt-6"
    >
      <div className="font-display text-5xl opacity-25 transition group-hover:opacity-50">{n}</div>
      <div>
        <h3 className="font-display text-2xl">{title}</h3>
        <p className="mt-1 max-w-lg text-sm opacity-70">{copy}</p>
      </div>
    </motion.div>
  )
}
