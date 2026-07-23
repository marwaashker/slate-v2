"use client"

import { useState, useRef, useEffect } from 'react'
import { fetchChat } from '../lib/api'


function ChatPanel({ columns, isOpen, onClose }) {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            text: "Hi! Ask me anything about your tasks — what to focus on, what's overdue, or how your week looks.",
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false);
    const [lastCall, setLastCall] = useState(0);
    const bottomRef = useRef(null);
    const COOLDOWN_MS = 8000;

    // auto scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function handleSubmit(e) {
        e.preventDefault()
        if (!input.trim() || loading) return;
        const now = Date.now()
        if (now - lastCall < COOLDOWN_MS) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'assistant',
                text: 'Please wait a moment before sending another message.'
            }])
            return
        }
        setLastCall(now);

        const userMessage = input.trim()
        setInput('')

        // add user message immediately
        const userMsg = { id: Date.now(), role: 'user', text: userMessage }
        setMessages(prev => [...prev, userMsg])
        setLoading(true)

        try {
            // pass history without the welcome message
            const history = messages.slice(1)
            const reply = await fetchChat(columns, history, userMessage)

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                text: reply,
            }])
        } catch (err) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                text: err.message.includes('Too many requests')
                    ? 'Too many requests — wait a moment and try again.'
                    : 'Something went wrong — try again.',
            }])
        } finally {
            setLoading(false)
        }
    }


    if (!isOpen) return null

    return (
        <div className="chat-overlay" onClick={onClose}>
            <div className="chat-panel" onClick={e => e.stopPropagation()}>

                {/* header */}
                <div className="chat-header">
                    <span className="chat-icon">✦</span>
                    <span className="chat-title">Ask about your tasks</span>
                    <button className="chat-close" onClick={onClose} aria-label="Close chat">×</button>
                </div>

                {/* messages */}
                <div className="chat-messages">
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-ai'}`}
                        >
                            {msg.role === 'assistant' && (
                                <span className="chat-msg-icon">✦</span>
                            )}
                            <p className="chat-msg-text">{msg.text}</p>
                        </div>
                    ))}

                    {loading && (
                        <div className="chat-msg chat-msg-ai">
                            <span className="chat-msg-icon">✦</span>
                            <div className="chat-typing">
                                <span /><span /><span />
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* input */}
                <form className="chat-input-form" onSubmit={handleSubmit}>
                    <input
                        className="chat-input"
                        type="text"
                        placeholder="Ask anything about your tasks…"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={loading}
                        autoFocus
                    />
                    <button
                        className="chat-send-btn"
                        type="submit"
                        disabled={loading || !input.trim()}
                        aria-label="Send message"
                    >
                        ↵
                    </button>
                </form>

            </div>
        </div>
    )
}

export default ChatPanel