import Sidebar from '../components/Sidebar'
import { useState } from 'react'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0 transition-all duration-200">

        {/* Mobile Top Bar (Visible only on small screens) */}
        <header className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-40">
          <span className="text-lg font-bold text-gray-900">Decivue</span>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 sm:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
