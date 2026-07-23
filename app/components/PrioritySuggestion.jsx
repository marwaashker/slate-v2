"use client"

import { useState } from 'react'
import { fetchPriority } from '../lib/api'

export function PrioritySuggestion({ todayTasks }) {
    const [suggestions, setSuggestions] = useState([]);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastCall, setLastCall] = useState(0)
    const COOLDOWN_MS = 8000

    async function handleAsk() {
        setLoading(true);
        setError(null);
        setShow(true);
        const now = Date.now()
        if (now - lastCall < COOLDOWN_MS) {
            setError('Please wait a moment before trying again')
            setShow(true)
            return
        }


        try {
            const result = await fetchPriority(todayTasks);
            setSuggestions(result);


        } catch (err) {
            setError(
                err.message.includes('Too many requests')
                    ? 'Too many requests — wait a moment'
                    : 'Could not get suggestions — try again'
            )
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="priority-wrap">

            <button
                className="priority-btn"
                onClick={handleAsk}
                disabled={loading}
            >
                <span className="priority-btn-icon">✦</span>
                {loading ? 'Thinking…' : 'What should I focus on?'}
            </button>

            {show && (

                <div className="priority-card">
                    <div className="priority-card-header">
                        <span>Focus on these today</span>
                        <button
                            className="priority-dismiss"
                            onClick={() => setShow(false)}
                            aria-label="Dismiss"
                        >×</button>
                    </div>

                    {loading && (
                        <div className="priority-loading">
                            <span /><span /><span />
                        </div>
                    )}

                    {error && <p className="priority-error">{error}</p>}

                    {!loading && !error && suggestions.length === 0 && (
                        <p className="priority-empty">No tasks to suggest — add some tasks first.</p>
                    )}

                    {!loading && !error && suggestions.map((s, i) => (
                        <div key={i} className="priority-item">
                            <span className="priority-num">{i + 1}</span>
                            <div>
                                <p className="priority-label">{s.label}</p>
                                <p className="priority-reason">{s.reason}</p>
                            </div>
                        </div>
                    ))}
                </div>

            )}

        </div>
    )

}
export default PrioritySuggestion;