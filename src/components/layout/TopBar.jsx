import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { formatPoints, formatUSD } from '../../lib/format.js'

// Sticky context bar shown above every page: live balances, engagement streak,
// the once-a-day play-point allowance, and the user's avatar (→ Settings).
export default function TopBar() {
  const { user, points, savings, streak, canClaimDaily, settings, dispatch, syncStatus, cloudConfigured, cloudUser } =
    useApp()

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-6 border-b border-white/[0.06] bg-ink-950/80 px-4 py-2.5 backdrop-blur-md md:-mx-8 md:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        {/* Balance chips */}
        <div className="flex items-center gap-2">
          <Chip icon="coins" label="Points" value={formatPoints(points)} />
          <Chip icon="savings" label="Kept" value={formatUSD(savings.total)} tone="brand" />
          <Chip icon="flame" label="Streak" value={streak} tone="amber" hideOnMobile />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {canClaimDaily ? (
            <Button
              size="sm"
              onClick={() => dispatch({ type: 'CLAIM_DAILY' })}
              title={`Claim ${formatPoints(settings.dailyAllowance)} play points`}
            >
              <Icon name="gift" size={15} />
              <span className="hidden sm:inline">Claim {formatPoints(settings.dailyAllowance)}</span>
              <span className="sm:hidden">Daily</span>
            </Button>
          ) : (
            <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
              <Icon name="check" size={14} className="text-brand-400" />
              Daily claimed
            </span>
          )}

          {cloudConfigured && cloudUser && (
            <Link
              to="/settings"
              className={[
                'hidden items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs sm:flex',
                syncStatus === 'error'
                  ? 'border-rose-500/25 bg-rose-500/[0.08] text-rose-300'
                  : 'border-white/[0.07] bg-white/[0.03] text-slate-400',
              ].join(' ')}
              title={`Cloud sync: ${syncStatus}`}
            >
              <Icon name="cloud" size={14} className={syncStatus === 'synced' ? 'text-brand-400' : undefined} />
              {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing…' : syncStatus === 'error' ? 'Error' : 'Local'}
            </Link>
          )}

          <Link
            to="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-base transition-colors hover:bg-white/[0.08]"
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

function Chip({ icon, label, value, tone = 'default', hideOnMobile = false }) {
  const TONES = {
    default: 'text-slate-100',
    brand: 'text-brand-300',
    amber: 'text-amber-300',
  }
  const ICON_TONES = {
    default: 'text-slate-500',
    brand: 'text-brand-400/70',
    amber: 'text-amber-400/70',
  }
  return (
    <div
      className={[
        'flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5',
        hideOnMobile ? 'hidden sm:flex' : '',
      ].join(' ')}
    >
      <Icon name={icon} size={14} className={ICON_TONES[tone]} />
      <span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
      <span className={['text-sm font-semibold tabular-nums', TONES[tone]].join(' ')}>{value}</span>
    </div>
  )
}
