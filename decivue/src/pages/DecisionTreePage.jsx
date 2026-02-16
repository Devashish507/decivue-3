import React, { useEffect } from 'react'
import { useLayout } from '../contexts/LayoutContext'
import DecisionTreeCanvas from '../components/DecisionTreeCanvas'
import DecisionChatbot from '../components/DecisionChatbot'

export default function DecisionTreePage() {
    const { setHideSidebar, setFullWidth } = useLayout()

    // Hide sidebar and go full-width for the tree view
    useEffect(() => {
        setHideSidebar(true)
        setFullWidth(true)
        return () => {
            setHideSidebar(false)
            setFullWidth(false)
        }
    }, [])

    return (
        <div className="h-screen w-full relative overflow-hidden">
            <DecisionTreeCanvas />
            <DecisionChatbot />
        </div>
    )
}
