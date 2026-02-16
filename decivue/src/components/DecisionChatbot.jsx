import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DecisionChatbot.css';

const PRE_DEFINED_QA = [
    {
        question: "How is the health score calculated?",
        answer: "The health score is a composite metric (0-100) based on three factors: Time Lag (if execution is behind the target date), Overdue Reviews, and low Confidence levels. 100 is perfectly healthy, while scores below 40 are considered 'At Risk'."
    },
    {
        question: "What happens if a decision is delayed?",
        answer: "If a decision's progress is more than 10% behind the expected time elapsed, the health score drops. If it's more than 20% behind, the 'Confidence' score automatically decays by 10% to reflect the increased execution risk."
    },
    {
        question: "How can I improve confidence?",
        answer: "You can improve confidence by 'Reaffirming' the decision (confirming assumptions are still valid), completing sub-decisions, or adding review notes that clarify implementation details."
    },
    {
        question: "What are 'Conflicts' in the tree?",
        answer: "Conflicts occur when two decisions have contradictory goals or dependencies. We visualize these as red dashed arrows. Active conflicts subtract confidence points and lower the overall health of the entire connected cluster."
    }
];

export default function DecisionChatbot({ isInline = false }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I'm your Decision Assistant. How can I help you understand your decision tree today?" }
    ]);
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleQuestionClick = (qa) => {
        setMessages(prev => [...prev, { role: 'user', text: qa.question }]);

        // Simulate thinking
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', text: qa.answer }]);
        }, 600);
    };

    const ChatWindowContent = (
        <div className={`chatbot-window ${isInline ? 'inline' : 'shadow-2xl border border-gray-100'}`}>
            {/* Header */}
            {!isInline && (
                <div className="chatbot-header bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="font-bold text-sm">Decision Assistant</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Messages */}
            <div className="chatbot-messages p-4 overflow-y-auto">
                {messages.map((msg, i) => (
                    <div key={i} className={`message-bubble ${msg.role} mb-4`}>
                        <div className={`p-3 rounded-2xl text-sm ${msg.role === 'assistant'
                            ? 'bg-gray-100 text-gray-800 rounded-bl-none'
                            : 'bg-blue-600 text-white rounded-br-none ml-auto max-w-[80%]'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div className="chatbot-suggestions p-4 border-t border-gray-50 flex flex-wrap gap-2 bg-gray-50 rounded-b-2xl">
                <p className="w-full text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Common Questions</p>
                {PRE_DEFINED_QA.map((qa, i) => (
                    <button
                        key={i}
                        onClick={() => handleQuestionClick(qa)}
                        className="text-xs bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 px-3 py-1.5 rounded-full transition-all text-left shadow-sm"
                    >
                        {qa.question}
                    </button>
                ))}
            </div>
        </div>
    );

    if (isInline) {
        return (
            <div className="decision-chatbot-inline-wrapper h-full bg-white">
                {ChatWindowContent}
            </div>
        );
    }

    return (
        <div className={`decision-chatbot-wrapper ${isOpen ? 'open' : 'closed'}`}>
            <button
                className="chatbot-toggle shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
                title="Decision Assistant"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="chatbot-motion-container"
                    >
                        {ChatWindowContent}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
