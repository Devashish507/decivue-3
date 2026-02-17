import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../assets/logo.png'
import {
    LayoutDashboard,
    Network,
    FileText,
    Users,
    ChevronRight,
    Settings,
    Bell
} from 'lucide-react'

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tree', label: 'Visual Tree', icon: Network },
    { path: '/decisions', label: 'Decisions', icon: FileText },
    { path: '/team/dashboard', label: 'Team Space', icon: Users },
]

export default function Sidebar() {
    const location = useLocation()

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 z-50 hidden md:flex flex-col">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                        <img src={logo} alt="Decivue Logo" className="relative h-9 w-auto transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">Decivue</span>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto scrollbar-premium">
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-3 mb-4">Main Navigation</div>
                {navItems.map(item => {
                    const isActive = item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path)
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                ? 'text-indigo-600'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                {/* Active background indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-x-0 -inset-y-0.5 bg-indigo-50/80 rounded-xl border border-indigo-100/50 -z-10"
                                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                    />
                                )}

                                <item.icon
                                    className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                                        }`}
                                />
                                <span>{item.label}</span>
                            </div>

                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="relative z-10"
                                >
                                    <ChevronRight className="w-4 h-4 text-indigo-400" />
                                </motion.div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between px-2 mb-2">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Bell className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Settings className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 cursor-pointer transition-all duration-300">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-indigo-200 shadow-lg">
                            JD
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">John Doe</p>
                        <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tight">Lead Architect</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
