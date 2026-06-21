import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import TopBar from './TopBar.jsx'
import OnboardingModal from '../onboarding/OnboardingModal.jsx'
import Icon from '../ui/Icon.jsx'
import AnimatedNumber from '../ui/AnimatedNumber.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { formatPoints, formatUSD } from '../../lib/format.js'

// Sidebar navigation, grouped so the app reads as a real product, not a flat list.
const NAV_SECTIONS = [
  {
    label: 'Play',
    items: [
      { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
      { to: '/markets', label: 'Markets', icon: 'markets' },
      { to: '/portfolio', label: 'Portfolio', icon: 'portfolio' },
    ],
  },
  {
    label: 'Progress',
    items: [
      { to: '/insights', label: 'Insights', icon: 'insights' },
      { to: '/money-kept', label: 'Money Kept', icon: 'savings' },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/social', label: 'Friends', icon: 'social' },
      { to: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
    ],
  },
]

// Mobile bottom tab bar: primary destinations plus a "More" sheet.
const MOBILE_LEFT = [
  { to: '/', label: 'Home', icon: 'dashboard', end: true },
  { to: '/markets', label: 'Markets', icon: 'markets' },
]
const MOBILE_RIGHT = [{ to: '/money-kept', label: 'Kept', icon: 'savings' }]
const MOBILE_MORE = [
  { to: '/portfolio', label: 'Portfolio', icon: 'portfolio' },
  { to: '/insights', label: 'Insights', icon: 'insights' },
  { to: '/social', label: 'Friends', icon: 'social' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { to: '/plus', label: 'Upside Plus', icon: 'plus' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

function navClass({ isActive }) {
  return [
    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
    isActive
      ? 'bg-brand-500/[0.10] text-slate-50'
      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
  ].join(' ')
}

function BrandMark() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Upside home">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-ink-950 shadow-glow-sm ring-1 ring-brand-300/40">
        <Icon name="logo" size={19} strokeWidth={2.75} />
      </span>
      <div>
        <p className="font-display text-[17px] font-bold leading-none tracking-tight text-slate-50">Upside</p>
        <p className="mt-1 text-[11px] text-slate-500">bet on yourself</p>
      </div>
    </Link>
  )
}

export default function Layout({ children }) {
  const { points, savings, onboarded } = useApp()
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden border-white/[0.06] md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col md:border-r md:bg-ink-900/60">
        <div className="px-5 py-5">
          <BrandMark />
        </div>

        {/* Balances summary */}
        <div className="mx-4 mb-4 grid grid-cols-2 gap-2">
          <div className="surface-muted px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Points</p>
            <AnimatedNumber
              value={points}
              format={formatPoints}
              className="text-sm font-semibold text-slate-100"
            />
          </div>
          <div className="surface-muted px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Kept</p>
            <AnimatedNumber
              value={savings.total}
              format={formatUSD}
              className="text-sm font-semibold text-brand-300"
            />
          </div>
        </div>

        <nav className="flex flex-col gap-4 overflow-y-auto px-3 pb-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                {section.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-gradient-to-b from-brand-300 to-brand-500" />
                        )}
                        <Icon
                          name={item.icon}
                          size={18}
                          className={
                            isActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300'
                          }
                        />
                        <span className="whitespace-nowrap">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* Upside Plus — set apart with a badge. */}
          <NavLink to="/plus" className={navClass}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-gradient-to-b from-brand-300 to-brand-500" />
                )}
                <Icon name="plus" size={18} className={isActive ? 'text-brand-300' : 'text-brand-400/80'} />
                <span className="whitespace-nowrap">Upside Plus</span>
                <span className="ml-auto rounded-full bg-brand-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-300">
                  Pro
                </span>
              </>
            )}
          </NavLink>
        </nav>

        <div className="mt-auto space-y-3 p-4">
          <NavLink to="/settings" className={navClass}>
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
          <p className="text-center text-[11px] leading-snug text-slate-600">
            Play money only. No real wagering.
            <br />
            Help:{' '}
            <a href="tel:1-800-426-2537" className="text-slate-500 hover:text-slate-400">
              1-800-GAMBLER
            </a>
          </p>
        </div>
      </aside>

      {/* Mobile top app bar */}
      <div className="sticky top-0 z-40 flex items-center border-b border-white/[0.06] bg-ink-950/80 px-4 py-3 backdrop-blur-md md:hidden">
        <BrandMark />
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 py-5 pb-28 md:px-8 md:py-6 md:pb-6">
        <div className="mx-auto max-w-5xl">
          <TopBar />
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.07] bg-ink-950/90 backdrop-blur-lg md:hidden">
        {/* "More" sheet (rendered above the bar) */}
        {moreOpen && (
          <>
            <div className="fixed inset-0 -z-10" onClick={() => setMoreOpen(false)} aria-hidden />
            <div className="absolute inset-x-0 bottom-full mb-2 px-3">
              <div className="surface animate-pop grid grid-cols-1 gap-0.5 p-2 shadow-pop">
                {MOBILE_MORE.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive ? 'bg-brand-500/10 text-brand-200' : 'text-slate-300 hover:bg-white/[0.05]',
                      ].join(' ')
                    }
                  >
                    <Icon name={item.icon} size={17} className="text-slate-500" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="mx-auto grid max-w-lg grid-cols-4 items-end">
          {MOBILE_LEFT.map((item) => (
            <MobileTab key={item.to} item={item} onNavigate={() => setMoreOpen(false)} />
          ))}

          {MOBILE_RIGHT.map((item) => (
            <MobileTab key={item.to} item={item} onNavigate={() => setMoreOpen(false)} />
          ))}

          {/* More toggle */}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            className={[
              'flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
              moreOpen ? 'text-brand-300' : 'text-slate-500',
            ].join(' ')}
          >
            <Icon name={moreOpen ? 'chevronDown' : 'menu'} size={20} />
            More
          </button>
        </div>
      </nav>

      {/* First-run onboarding. */}
      <OnboardingModal open={!onboarded} />
    </div>
  )
}

function MobileTab({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
          isActive ? 'text-brand-300' : 'text-slate-500',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon name={item.icon} size={20} className={isActive ? 'text-brand-300' : 'text-slate-500'} />
          {item.label}
        </>
      )}
    </NavLink>
  )
}
