import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import UrgeModal from '../urge/UrgeModal.jsx'
import TopBar from './TopBar.jsx'
import OnboardingModal from '../onboarding/OnboardingModal.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { formatPoints, formatUSD } from '../../lib/format.js'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/markets', label: 'Markets', icon: '📈' },
  { to: '/portfolio', label: 'Portfolio', icon: '🎟️' },
  { to: '/insights', label: 'Insights', icon: '📊' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { to: '/money-kept', label: 'Money Kept', icon: '💚' },
  { to: '/plus', label: 'Upside Plus', icon: '✨' },
]

export default function Layout({ children }) {
  const { points, savings, onboarded } = useApp()
  const [urgeOpen, setUrgeOpen] = useState(false)

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar (desktop) / top bar (mobile) */}
      <aside className="md:sticky md:top-0 md:h-screen md:w-64 md:flex-col md:border-r md:border-white/10 md:bg-ink-800/60 flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="text-2xl" aria-hidden>📈</span>
          <div>
            <p className="text-lg font-extrabold leading-none text-slate-50">Upside</p>
            <p className="text-[11px] text-slate-400">bet on yourself</p>
          </div>
        </div>

        {/* Balances summary */}
        <div className="mx-4 mb-4 hidden grid-cols-2 gap-2 md:grid">
          <div className="surface-muted px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Points</p>
            <p className="text-sm font-bold text-slate-100">{formatPoints(points)}</p>
          </div>
          <div className="surface-muted px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Kept</p>
            <p className="text-sm font-bold text-brand-300">{formatUSD(savings.total)}</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-500/15 text-brand-200'
                    : 'text-slate-300 hover:bg-white/5 hover:text-slate-100',
                ].join(' ')
              }
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Persistent urge-intervention button */}
        <div className="mt-auto hidden p-4 md:block">
          <button
            onClick={() => setUrgeOpen(true)}
            className="w-full rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-500/20"
          >
            🫧 Feeling the urge?
          </button>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              [
                'mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-500/15 text-brand-200'
                  : 'text-slate-300 hover:bg-white/5 hover:text-slate-100',
              ].join(' ')
            }
          >
            <span aria-hidden>⚙️</span>
            Settings
          </NavLink>
          <p className="mt-3 text-center text-[11px] leading-snug text-slate-500">
            Play money only. No real wagering.
            <br />
            Help: 1-800-GAMBLER
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-5xl">
          <TopBar onUrge={() => setUrgeOpen(true)} />
          {children}
        </div>
      </main>

      {/* Floating urge button on mobile (sidebar version is hidden there) */}
      <button
        onClick={() => setUrgeOpen(true)}
        className="fixed bottom-5 right-5 z-40 rounded-full border border-amber-400/40 bg-amber-500/90 px-5 py-3 text-sm font-bold text-ink-900 shadow-lg shadow-amber-900/30 md:hidden"
      >
        🫧 Urge?
      </button>

      <UrgeModal open={urgeOpen} onClose={() => setUrgeOpen(false)} />

      {/* First-run onboarding (philosophy + name/avatar/allowance). */}
      <OnboardingModal open={!onboarded} />
    </div>
  )
}
