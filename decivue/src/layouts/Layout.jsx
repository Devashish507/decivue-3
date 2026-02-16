import Sidebar from '../components/Sidebar'
import { useLayout } from '../contexts/LayoutContext'

export default function Layout({ children }) {
  const { hideSidebar, fullWidth } = useLayout()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      {!hideSidebar && <Sidebar />}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${hideSidebar ? '' : 'md:ml-64'}`}>

        {/* Mobile Top Bar (Visible only on small screens) */}
        {!hideSidebar && (
          <header className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-40">
            <span className="text-lg font-bold text-gray-900">Decivue</span>
          </header>
        )}

        {/* Main Content */}
        <main className={`flex-1 overflow-x-hidden ${fullWidth ? 'p-0' : 'p-6 sm:p-8'}`}>
          <div className={`${fullWidth ? 'w-full' : 'max-w-7xl mx-auto w-full'}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
