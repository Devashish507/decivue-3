import React from 'react'
import DecisionTreeCanvas from '../components/DecisionTreeCanvas'
import DecisionChatbot from '../components/DecisionChatbot'

export default function DecisionTreePage() {
    return (
        <div className="h-screen w-full relative overflow-hidden">
            <DecisionTreeCanvas />
            <DecisionChatbot />
        </div>
    )
}
