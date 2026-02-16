export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
            </div>
            <div className="h-12 w-12 bg-gray-100 rounded-full animate-pulse flex-shrink-0" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-100 rounded-lg w-full animate-pulse" />
            <div className="h-3 bg-gray-100 rounded-lg w-2/3 animate-pulse" />
          </div>
          <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
            <div className="h-6 bg-gray-100 rounded-full w-20 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded-lg w-16 animate-pulse" />
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
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <div className="h-3 bg-gray-100 rounded-lg w-24 animate-pulse" />
          <div className="h-8 bg-gray-100 rounded-lg w-16 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
