import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Markets from './pages/Markets.jsx'
import Portfolio from './pages/Portfolio.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import MoneyKept from './pages/MoneyKept.jsx'
import Insights from './pages/Insights.jsx'
import Settings from './pages/Settings.jsx'
import Plus from './pages/Plus.jsx'
import Social from './pages/Social.jsx'

// Top-level app shell + client-side routes. All state lives in <AppProvider>
// (mounted in main.jsx), so pages just read/dispatch via the useApp() hook.
export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/social" element={<Social />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/money-kept" element={<MoneyKept />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/plus" element={<Plus />} />
        {/* Unknown routes fall back to the dashboard. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
