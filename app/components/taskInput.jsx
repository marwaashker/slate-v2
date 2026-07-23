"use client"

import { useState } from 'react';
import { fetchParseTask } from '../lib/api'

export default function TaskInput({ colId, onAdd, columns }) {

    const [input, setInput] = useState("");
    const [isAI, setIsAi] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setError(null)

        if (isAI) {
            setLoading(true)
            try {
                const parsedTask = await fetchParseTask(input);
                let targetColId = colId;
                if (parsedTask.day && parsedTask.day !== 'today') {
                    const matchedCol = columns.find(col => col.label.toLowerCase() === parsedTask.day.toLowerCase());
                    if (matchedCol) targetColId = matchedCol.id;
                }

                onAdd(targetColId, parsedTask.label, parsedTask.priority);
                setInput("");
            } catch (err) {
                setError('Could not parse task — try again')
            } finally {
                setLoading(false)
            }
        } else {
            onAdd(colId, input.trim(), 'medium');
            setInput("");
        }


    }



    return (

        <div>
            <form className="task-input-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="task-input"
                    placeholder={isAI ? 'Describe naturally… "call Ahmed tomorrow urgent"' : 'Add a task…'}
                />
                <button
                    type="button"
                    className={`ai-toggle-btn ${isAI ? 'ai-toggle-active' : ''}`}
                    onClick={() => { setIsAi(p => !p); setError(null) }}
                    aria-label="Toggle AI input"
                    title={isAI ? 'Switch to normal input' : 'Switch to AI input'}
                >
                    ✦
                </button>
                <button className="task-input-btn" type="submit" aria-label="Add task" disabled={loading}> {loading ? '…' : isAI ? '↵' : '+'} </button>
                {error && <p className="task-input-error">{error}</p>}
            </form>

        </div>
    )

}