import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { formatPoints, formatUSD } from '../../lib/format.js'

// Sticky context bar shown above every page: live balances, engagement streak,
// the once-a-day play-point allowance, and the user's avatar (→ Settings).
// Gives the app a polished "logged-in product" frame without a real backend.
export default function TopBar({ onUrge }) {
  const { user, points, savings, streak, canClaimDaily, settings, dispatch } = useApp()

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-6 border-b border-white/10 bg-ink-900/80 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        {/* Balance chips */}
        <div className="flex items-center gap-2">
          <Chip label="Points" value={formatPoints(points)} tone="default" />
          <Chip label="Kept" value={formatUSD(savings.total)} tone="brand" />
          <Chip label="Streak" value={`🔥 ${streak}`} tone="amber" hideOnMobile />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {canClaimDaily ? (
            <Button
              size="sm"
              onClick={() => dispatch({ type: 'CLAIM_DAILY' })}
              title={`Claim ${formatPoints(settings.dailyAllowance)} play points`}
            >
              <span aria-hidden>🎁</span>
              <span className="hidden sm:inline">Claim {formatPoints(settings.dailyAllowance)}</span>
              <span className="sm:hidden">Daily</span>
            </Button>
          ) : (
            <span className="hidden text-xs text-slate-500 sm:inline">Daily bonus claimed ✓</span>
          )}

          <button
            onClick={onUrge}
            className="hidden rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-500/20 md:inline-flex"
          >
            🫧 Urge?
          </button>

          <Link
            to="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg transition-colors hover:bg-white/15"
            title={`${user.name} · Settings`}
            aria-label="Profile and settings"
          >
            <span aria-hidden>{user.avatar}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

function Chip({ label, value, tone = 'default', hideOnMobile = false }) {
  const TONES = {
    default: 'text-slate-100',
    brand: 'text-brand-300',
    amber: 'text-amber-300',
  }
  return (
    <div
      className={[
        'rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5',
        hideOnMobile ? 'hidden sm:block' : '',
      ].join(' ')}
    >
      <span className="mr-1.5 text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
      <span className={['text-sm font-bold tabular-nums', TONES[tone]].join(' ')}>{value}</span>
    </div>
  )
}
