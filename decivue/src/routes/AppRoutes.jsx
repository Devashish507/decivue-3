import { Routes, Route } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import DecisionList from '../pages/DecisionList'
import DecisionLibraryPage from '../pages/DecisionLibraryPage'
import DecisionDetail from '../pages/DecisionDetail'
import DecisionTreePage from '../pages/DecisionTreePage'
import DecisionFocusPage from '../pages/DecisionFocusPage'
import TeamDashboard from '../pages/TeamDashboard'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/decisions" element={<DecisionLibraryPage />} />
      <Route path="/decisions/list" element={<DecisionList />} />
      <Route path="/decisions/:id" element={<DecisionDetail />} />
      <Route path="/decisions/:id/focus" element={<DecisionFocusPage />} />
      <Route path="/tree" element={<DecisionTreePage />} />
      <Route path="/team/dashboard" element={<TeamDashboard />} />
      <Route path="/team/:id/dashboard" element={<TeamDashboard />} />
    </Routes>
  )
}
