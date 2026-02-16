export default function StatCard({ label, value, color, icon }) {
  const colorMap = {
    blue: 'border-blue-100',
    green: 'border-green-100',
    amber: 'border-amber-100',
    red: 'border-red-100',
    purple: 'border-purple-100',
    gray: 'border-gray-100',
  }

  const iconBgMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-600',
  }

  return (
    <div className={`relative overflow-hidden bg-white rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${colorMap[color] || colorMap.gray}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBgMap[color] || iconBgMap.gray}`}>
          {icon}
        </div>
      </div>

      {/* Decorative background circle */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-5 pointer-events-none ${(iconBgMap[color] || iconBgMap.gray).split(' ')[0]}`} />
    </div>
  )
}
