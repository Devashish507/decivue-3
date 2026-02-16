import React, { useState } from 'react'

export default function TreeControlsBar({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    showConflicts,
    onToggleConflicts,
    onAutoLayout,
    focusId,
    navigate,
}) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const handleResetFocus = () => {
        navigate(window.location.pathname);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    return (
        <div className={`absolute top-4 left-4 z-20 flex flex-col gap-2 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-12'}`}>
            {/* Main Controls Panel */}
            <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 ${isExpanded ? 'p-4' : 'p-2'}`}>

                {/* Toggle / Header */}
                <div className="flex items-center justify-between mb-2">
                    {isExpanded && <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tree Controls</h3>}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        title={isExpanded ? "Collapse" : "Expand"}
                    >
                        {isExpanded ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </button>
                </div>

                {isExpanded && (
                    <div className="space-y-4 animate-fade-in">
                        {/* Search */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Find decision..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Filter */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500">View</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => onStatusFilterChange(e.target.value)}
                                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="all">All Statuses</option>
                                <option value="healthy">Healthy</option>
                                <option value="review">Needs Review</option>
                                <option value="at-risk">At Risk</option>
                            </select>
                        </div>

                        {/* Toggles */}
                        <label className="flex items-center gap-2 cursor-pointer p-1hover:bg-gray-50 rounded">
                            <input
                                type="checkbox"
                                checked={showConflicts}
                                onChange={(e) => onToggleConflicts(e.target.checked)}
                                className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Show Conflicts</span>
                        </label>

                        {/* Actions */}
                        <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                            <button
                                onClick={onAutoLayout}
                                className="flex items-center justify-center gap-2 w-full px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Auto Layout
                            </button>

                            <button
                                onClick={toggleFullscreen}
                                className="flex items-center justify-center gap-2 w-full px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                            >
                                {isFullscreen ? (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0l5 5M4 4h5M4 4v5m11 11l5 5m0 0l-5-5m5 5v-5m0 5h-5" />
                                        </svg>
                                        Exit Fullscreen
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                        Fullscreen
                                    </>
                                )}
                            </button>

                            {focusId && (
                                <button
                                    onClick={handleResetFocus}
                                    className="flex items-center justify-center gap-2 w-full px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                                >
                                    Global View
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
