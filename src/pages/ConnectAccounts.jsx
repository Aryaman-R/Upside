import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Icon from '../components/ui/Icon.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import AnimatedNumber from '../components/ui/AnimatedNumber.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ConnectAccountModal from '../components/accounts/ConnectAccountModal.jsx'
import FundBalanceModal from '../components/accounts/FundBalanceModal.jsx'
import { useApp } from '../context/AppContext.jsx'
import { formatUSD, formatDate, accountKindLabel } from '../lib/format.js'

// How the money moves, shown as three plain-language steps up top.
function HowItWorks() {
  const steps = [
    { icon: 'building', title: 'Fund your balance', body: 'Add money from your bank. This is what you predict with.' },
    { icon: 'zap', title: 'Predict on real events', body: 'Stake from your balance. Win and the profit is yours to keep or withdraw.' },
    { icon: 'savings', title: 'Losses become savings', body: 'Lose, and your stake (minus a small fee) is invested in your Roth IRA — not gone.' },
  ]
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {steps.map((s, i) => (
        <Card key={s.title} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/12 text-brand-300">
              <Icon name={s.icon} size={16} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step {i + 1}</span>
          </div>
          <p className="text-sm font-semibold text-slate-100">{s.title}</p>
          <p className="text-sm text-slate-400">{s.body}</p>
        </Card>
      ))}
    </div>
  )
}

export default function ConnectAccounts() {
  const { funding, balance, destinations, defaultDestinationId, netWorth, savings, dispatch } = useApp()
  const [connectMode, setConnectMode] = useState(null) // 'funding' | 'destination' | null
  const [fund, setFund] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your money"
        title="Connect your accounts"
        subtitle="Fund your balance, and choose where a losing prediction goes instead of disappearing."
      />

      {/* Simulation banner */}
      <Card className="flex items-center gap-3 border-brand-500/25 bg-brand-500/[0.06]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/12 text-brand-300">
          <Icon name="shield" size={18} />
        </span>
        <p className="text-sm text-slate-300">
          This is a <strong className="text-slate-100">demo</strong>. Connecting an account is simulated — no
          login is requested, no real institution is contacted, and no money ever moves.
        </p>
      </Card>

      <Reveal><HowItWorks /></Reveal>

      {/* Net worth summary */}
      <Reveal delay={60}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card variant="glow" className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-wide text-slate-500">Upside balance</p>
            <AnimatedNumber value={balance} format={formatUSD} as="p" className="text-2xl font-extrabold text-slate-50" />
            <p className="text-xs text-slate-500">Liquid — predict or withdraw</p>
          </Card>
          <Card className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-wide text-slate-500">Invested (from losses)</p>
            <AnimatedNumber value={savings.total} format={formatUSD} as="p" className="text-2xl font-extrabold text-brand-300" />
            <p className="text-xs text-slate-500">Growing in your accounts</p>
          </Card>
          <Card className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total on Upside</p>
            <AnimatedNumber value={netWorth} format={formatUSD} as="p" className="text-2xl font-extrabold text-slate-50" />
            <p className="text-xs text-slate-500">Balance + invested</p>
          </Card>
        </div>
      </Reveal>

      {/* Funding source ----------------------------------------------------- */}
      <section className="space-y-3" data-tour="connect-funding">
        <h2 className="text-lg font-bold text-slate-100">Funding source</h2>
        <Card className="space-y-4">
          {funding?.connected ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-lg">🏦</span>
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                    {funding.institution} <span className="text-slate-500">••{funding.mask}</span>
                    <Badge tone="win">Connected</Badge>
                  </p>
                  <p className="text-xs text-slate-500">
                    Linked {funding.connectedAt ? formatDate(funding.connectedAt) : 'in this demo'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setFund(true)}>
                  <Icon name="plusSign" size={15} /> Add funds
                </Button>
                <Button size="sm" variant="outline" onClick={() => setConnectMode('funding')}>
                  Change
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon="building"
              title="No funding source yet"
              body="Link a bank or debit card to fund your Upside balance. Simulated — no real login."
              action={
                <Button size="sm" onClick={() => setConnectMode('funding')}>
                  Connect a bank
                </Button>
              }
            />
          )}
        </Card>
      </section>

      {/* Destination accounts ----------------------------------------------- */}
      <section className="space-y-3" data-tour="connect-destinations">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-100">Where losses go</h2>
          <Button size="sm" variant="outline" onClick={() => setConnectMode('destination')}>
            <Icon name="plusSign" size={15} /> Connect account
          </Button>
        </div>

        {destinations.length === 0 ? (
          <Card padding="none">
            <EmptyState
              icon="savings"
              title="No destination account yet"
              body="Connect a Roth IRA or savings account so a losing prediction turns into money invested in your future."
              action={
                <Button size="sm" onClick={() => setConnectMode('destination')}>
                  Connect a Roth IRA
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="space-y-2">
            {destinations.map((d) => {
              const isDefault = d.id === defaultDestinationId
              return (
                <Card key={d.id} className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/12 text-brand-300">
                      <Icon name="building" size={18} />
                    </span>
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                        {accountKindLabel(d.kind)}
                        <span className="text-slate-500">· {d.institution} ••{d.mask}</span>
                        {isDefault && <Badge tone="brand">Default</Badge>}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatUSD(d.balance)} invested here so far
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dispatch({ type: 'SET_DEFAULT_DESTINATION', payload: { id: d.id } })}
                      >
                        Make default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dispatch({ type: 'REMOVE_DESTINATION', payload: { id: d.id } })}
                    >
                      <Icon name="x" size={15} />
                    </Button>
                  </div>
                </Card>
              )
            })}
            <p className="px-1 text-xs text-slate-500">
              The <span className="text-brand-300">default</span> account receives every redirected loss. Manage it
              anytime, or change it in <Link to="/settings" className="text-brand-300 hover:underline">Settings</Link>.
            </p>
          </div>
        )}
      </section>

      <ConnectAccountModal
        open={connectMode !== null}
        mode={connectMode || 'destination'}
        onClose={() => setConnectMode(null)}
      />
      <FundBalanceModal open={fund} onClose={() => setFund(false)} />
    </div>
  )
}
