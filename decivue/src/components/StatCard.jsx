import { motion } from 'framer-motion'

export default function StatCard({ label, value, color, icon }) {
  const colorMap = {
    blue: 'border-indigo-100/50 shadow-indigo-500/5',
    green: 'border-emerald-100/50 shadow-emerald-500/5',
    amber: 'border-amber-100/50 shadow-amber-500/5',
    red: 'border-rose-100/50 shadow-rose-500/5',
    purple: 'border-purple-100/50 shadow-purple-500/5',
    gray: 'border-slate-100/50 shadow-slate-500/5',
  }

  const iconBgMap = {
    blue: 'bg-indigo-50 text-indigo-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-rose-50 text-rose-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-slate-50 text-slate-600',
  }

  const accentColorMap = {
    blue: 'from-indigo-500 to-blue-600',
    green: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    red: 'from-rose-500 to-red-600',
    purple: 'from-purple-500 to-indigo-600',
    gray: 'from-slate-500 to-slate-600',
  }

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative overflow-hidden bg-white rounded-3xl border p-6 shadow-xl transition-all duration-300 ${colorMap[color] || colorMap.gray}`}
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">{label}</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">{value}</h3>
          </div>
        </div>
        <div className={`p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300 ${iconBgMap[color] || iconBgMap.gray}`}>
          {icon}
        </div>
      </div>

      {/* Modern Gradient Background Accent */}
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${accentColorMap[color] || accentColorMap.gray}`} />

      {/* Subtle border accent */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${iconBgMap[color] || iconBgMap.gray}`} />
    </motion.div>
  )
}
