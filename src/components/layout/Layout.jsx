import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import UrgeModal from '../urge/UrgeModal.jsx'
import TopBar from './TopBar.jsx'
import OnboardingModal from '../onboarding/OnboardingModal.jsx'
import Icon from '../ui/Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { formatPoints, formatUSD } from '../../lib/format.js'

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/markets', label: 'Markets', icon: 'markets' },
  { to: '/portfolio', label: 'Portfolio', icon: 'portfolio' },
  { to: '/insights', label: 'Insights', icon: 'insights' },
  { to: '/social', label: 'Friends', icon: 'social' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { to: '/money-kept', label: 'Money Kept', icon: 'savings' },
  { to: '/plus', label: 'Upside Plus', icon: 'plus' },
]

function navClass({ isActive }) {
  return [
    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-white/[0.06] text-slate-50' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
  ].join(' ')
}

export default function Layout({ children }) {
  const { points, savings, onboarded } = useApp()
  const [urgeOpen, setUrgeOpen] = useState(false)

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar (desktop) / top bar (mobile) */}
      <aside className="flex flex-col border-white/[0.06] md:sticky md:top-0 md:h-screen md:w-64 md:flex-col md:border-r md:bg-ink-900/60">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 text-ink-950 shadow-sm shadow-brand-500/30">
            <Icon name="trendingUp" size={18} strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-[15px] font-bold leading-none tracking-tightish text-slate-50">Upside</p>
            <p className="mt-1 text-[11px] text-slate-500">bet on yourself</p>
          </div>
        </div>

        {/* Balances summary (desktop) */}
        <div className="mx-4 mb-4 hidden grid-cols-2 gap-2 md:grid">
          <div className="surface-muted px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Points</p>
            <p className="text-sm font-semibold tabular-nums text-slate-100">{formatPoints(points)}</p>
          </div>
          <div className="surface-muted px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Kept</p>
            <p className="text-sm font-semibold tabular-nums text-brand-300">{formatUSD(savings.total)}</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:gap-0.5 md:overflow-visible md:pb-0">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute inset-y-1.5 left-0 hidden w-0.5 rounded-full bg-brand-400 md:block" />
                  )}
                  <Icon
                    name={item.icon}
                    size={18}
                    className={isActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300'}
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Persistent urge-intervention button */}
        <div className="mt-auto hidden p-4 md:block">
          <button
            onClick={() => setUrgeOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/[0.08] px-4 py-2.5 text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-500/[0.14]"
          >
            <Icon name="lifebuoy" size={16} />
            Feeling the urge?
          </button>
          <NavLink to="/settings" className={navClass} style={{ marginTop: '0.5rem' }}>
            {({ isActive }) => (
              <>
                <Icon
                  name="settings"
                  size={18}
                  className={isActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300'}
                />
                <span>Settings</span>
              </>
            )}
          </NavLink>
          <p className="mt-3 text-center text-[11px] leading-snug text-slate-600">
            Play money only. No real wagering.
            <br />
            Help: 1-800-GAMBLER
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 py-5 md:px-8 md:py-6">
        <div className="mx-auto max-w-5xl">
          <TopBar onUrge={() => setUrgeOpen(true)} />
          {children}
        </div>
      </main>

      {/* Floating urge button on mobile (sidebar version is hidden there) */}
      <button
        onClick={() => setUrgeOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500 px-5 py-3 text-sm font-bold text-ink-950 shadow-lg shadow-amber-900/30 md:hidden"
      >
        <Icon name="lifebuoy" size={16} />
        Urge?
      </button>

      <UrgeModal open={urgeOpen} onClose={() => setUrgeOpen(false)} />

      {/* First-run onboarding (philosophy + name/avatar/allowance). */}
      <OnboardingModal open={!onboarded} />
    </div>
  )
}
