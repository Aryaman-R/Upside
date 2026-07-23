import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import TopBar from './TopBar.jsx'
import OnboardingModal from '../onboarding/OnboardingModal.jsx'
import UrgeModal from '../urge/UrgeModal.jsx'
import Icon from '../ui/Icon.jsx'
import AnimatedNumber from '../ui/AnimatedNumber.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { formatUSD } from '../../lib/format.js'

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
    label: 'Money',
    items: [
      { to: '/money-kept', label: 'Invested', icon: 'savings' },
      { to: '/connect', label: 'Accounts', icon: 'building' },
      { to: '/insights', label: 'Insights', icon: 'insights' },
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
const MOBILE_RIGHT = [{ to: '/money-kept', label: 'Invested', icon: 'savings' }]
const MOBILE_MORE = [
  { to: '/portfolio', label: 'Portfolio', icon: 'portfolio' },
  { to: '/connect', label: 'Accounts', icon: 'building' },
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
      {/* Exact brand mark, snipped from Upside Logo.svg — floating, no container. */}
      <img src="/logo-mark.svg" alt="Upside" className="h-9 w-9 shrink-0" />
      <div>
        <p className="font-display text-[17px] font-bold leading-none tracking-tight text-slate-50">Upside</p>
        <p className="mt-1 text-[11px] text-slate-500">bet on yourself</p>
      </div>
    </Link>
  )
}

export default function Layout({ children }) {
  const { balance, savings, onboarded } = useApp()
  const [moreOpen, setMoreOpen] = useState(false)
  const [urgeOpen, setUrgeOpen] = useState(false)

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
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Balance</p>
            <AnimatedNumber
              value={balance}
              format={formatUSD}
              className="text-sm font-semibold text-slate-100"
            />
          </div>
          <div className="surface-muted px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Invested</p>
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
          {/* Always-available urge intervention — never locks, even on a break. */}
          <button
            data-tour="take-a-pause"
            onClick={() => setUrgeOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-lg border border-brand-500/25 bg-brand-500/[0.08] px-3 py-2 text-sm font-medium text-brand-200 transition-colors hover:bg-brand-500/[0.14]"
          >
            <Icon name="wind" size={17} className="text-brand-300" />
            Take a pause
          </button>
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
            Demo — funds are simulated.
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

      {/* Floating "Take a pause" pill (mobile) — sits above the bottom tab bar. */}
      <button
        onClick={() => setUrgeOpen(true)}
        aria-label="Take a pause"
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full border border-brand-500/30 bg-ink-900/90 px-4 py-2.5 text-sm font-semibold text-brand-200 shadow-pop backdrop-blur-md md:hidden"
      >
        <Icon name="wind" size={16} className="text-brand-300" />
        Pause
      </button>

      {/* Global urge-intervention flow (mounted here so it's reachable anywhere). */}
      <UrgeModal open={urgeOpen} onClose={() => setUrgeOpen(false)} />

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
