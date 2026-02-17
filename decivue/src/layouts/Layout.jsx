import Sidebar from '../components/Sidebar'
import { useLayout } from '../contexts/LayoutContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Layout({ children }) {
  const { hideSidebar, fullWidth } = useLayout()

  return (
    <div className="min-h-screen bg-slate-50/50 flex relative overflow-hidden">
      {/* Visual Background Elements */}
      <div className="absolute top-0 right-0 -u-z-10 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 -u-z-10 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />

      {/* Left Sidebar */}
      {!hideSidebar && <Sidebar />}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${hideSidebar ? '' : 'md:ml-64'}`}>

        {/* Mobile Top Bar */}
        {!hideSidebar && (
          <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-40">
            <span className="text-xl font-black text-slate-900 tracking-tighter">Decivue</span>
          </header>
        )}

        {/* Main Content */}
        <main className={`flex-1 overflow-x-hidden ${fullWidth ? 'p-0' : 'p-6 sm:p-10'}`}>
          <div className={`${fullWidth ? 'w-full' : 'max-w-[1440px] mx-auto w-full'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
