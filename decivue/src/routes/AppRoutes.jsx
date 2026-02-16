import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Dashboard from '../pages/Dashboard'
import DecisionList from '../pages/DecisionList'
import DecisionLibraryPage from '../pages/DecisionLibraryPage'
import DecisionDetail from '../pages/DecisionDetail'
import DecisionTreePage from '../pages/DecisionTreePage'
import DecisionFocusPage from '../pages/DecisionFocusPage'
import TeamDashboard from '../pages/TeamDashboard'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const pageTransition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1],
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  )
}

export default function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
        <Route path="/decisions" element={<AnimatedPage><DecisionLibraryPage /></AnimatedPage>} />
        <Route path="/decisions/list" element={<AnimatedPage><DecisionList /></AnimatedPage>} />
        <Route path="/decisions/:id" element={<AnimatedPage><DecisionDetail /></AnimatedPage>} />
        <Route path="/decisions/:id/focus" element={<AnimatedPage><DecisionFocusPage /></AnimatedPage>} />
        <Route path="/tree" element={<AnimatedPage><DecisionTreePage /></AnimatedPage>} />
        <Route path="/team/dashboard" element={<AnimatedPage><TeamDashboard /></AnimatedPage>} />
        <Route path="/team/:id/dashboard" element={<AnimatedPage><TeamDashboard /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  )
}
