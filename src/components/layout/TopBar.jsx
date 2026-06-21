import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import AnimatedNumber from '../ui/AnimatedNumber.jsx'
import Avatar from '../ui/Avatar.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { formatPoints, formatUSD } from '../../lib/format.js'

// Sticky context bar shown above every page: live balances, engagement streak,
// the once-a-day play-point allowance, and the user's avatar (→ Settings).
export default function TopBar() {
  const { user, points, savings, streak, canClaimDaily, settings, dispatch, syncStatus, cloudConfigured, cloudUser } =
    useApp()

  return (
    <header className="relative z-30 -mx-4 mb-6 border-b border-white/[0.06] bg-ink-950/80 px-4 py-2.5 backdrop-blur-md md:sticky md:top-0 md:-mx-8 md:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        {/* Balance chips */}
        <div className="flex items-center gap-2">
          <Chip icon="coins" label="Points" value={points} format={formatPoints} />
          <Chip icon="savings" label="Kept" value={savings.total} format={formatUSD} tone="brand" />
          <Chip icon="flame" label="Streak" value={streak} format={(n) => Math.round(n)} tone="amber" hideOnMobile />
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
            className="rounded-full transition-transform hover:scale-105"
            title={`${user.name} · Settings`}
            aria-label="Profile and settings"
          >
            <Avatar emoji={user.avatar} size="sm" />
          </Link>
        </div>
      </div>
    </header>
  )
}

function Chip({ icon, label, value, format, tone = 'default', hideOnMobile = false }) {
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
      <AnimatedNumber value={value} format={format} className={['text-sm font-semibold', TONES[tone]].join(' ')} />
    </div>
  )
}
