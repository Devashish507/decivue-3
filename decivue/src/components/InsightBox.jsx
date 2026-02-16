import { motion } from 'framer-motion';
import './InsightBox.css';

export default function InsightBox({ insights }) {
  if (!insights || !insights.length) return null

  return (
    <div className="sticky-note-container">
      <motion.div
        className="sticky-note"
        initial={{ y: 20, opacity: 0, rotate: -5 }}
        animate={{ y: 0, opacity: 1, rotate: -1.5 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="sticky-note-pin"></div>
        <div className="sticky-note-corner"></div>

        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="sticky-note-title">Suggestions</h3>
        </div>

        <p className="sticky-note-subtitle">These are suggestions, not commands</p>

        <ul className="sticky-note-content">
          {insights.map((insight, i) => (
            <motion.li
              key={i}
              className="sticky-note-item"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * i }}
            >
              {insight.message || insight}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}
