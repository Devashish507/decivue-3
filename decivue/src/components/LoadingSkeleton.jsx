export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
          <div className="flex justify-between mb-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded-full w-20" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="flex gap-2">
            <div className="h-2 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-12" />
        </div>
      ))}
    </div>
  )
}
