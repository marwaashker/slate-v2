"use client"

import { useState, useRef, useEffect, startTransition } from 'react'
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
        const now = Date.now();


        if (now - lastCall < COOLDOWN_MS) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'assistant',
                text: 'Please wait a moment before sending another message.'
            }])
            return
        }
        setLastCall(now);

        // add user message immediately
        const userMessage = input.trim()
        setInput('');
        const userMsg = { id: Date.now(), role: 'user', text: userMessage }
        setMessages(prev => [...prev, userMsg])
        const assistantId = Date.now() + 1;
        const assistantMsg = {
            id: assistantId,
            role: 'assistant',
            text: ''
        }

        setMessages(prev => [...prev, assistantMsg])





        // add empty assistant message that we'll fill in chunk by chunk

        try {
            // pass history without the welcome message

            const history = messages.slice(1)
            await fetchChat(columns, history, userMessage, (chunk) => {
                startTransition(() => {
                    setMessages(prev => prev.map(msg =>
                        msg.id === assistantId
                            ? { ...msg, text: msg.text + chunk }
                            : msg
                    ))
                })
            })

        } catch (err) {
            setMessages(prev => prev.map(msg =>
                msg.id === assistantId
                    ? {
                        ...msg, text: err.message.includes('Too many requests')
                            ? 'Too many requests — wait a moment.'
                            : 'Something went wrong — try again.'
                    }
                    : msg
            ))
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