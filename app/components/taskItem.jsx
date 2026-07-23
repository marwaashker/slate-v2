"use client"

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { fetchSubtasks } from '../lib/api'


export default function TaskItem({ item, onDelete, onToggle, onAddSubtasks, isOverlay, onPriority }) {

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const [loadingSubtasks, setLoadingSubtasks] = useState(false);
    const [showPriority, setShowPriority] = useState(false);
    const [error, setError] = useState(null);
    const [lastCall, setLastCall] = useState(0)
    const COOLDOWN_MS = 8000


    const PRIORITY_LABELS = ['low', 'medium', 'high'];
    const PRIORITY_COLORS = {
        high: '#e24b4a',
        medium: '#ef9f27',
        low: '#639922',
    }

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.25 : 1,
        pointerEvents: isDragging ? 'none' : undefined,
    }

    async function handleSubtasks() {
        if (!onAddSubtasks) return;
        setLoadingSubtasks(true);
        const now = Date.now()
        if (now - lastCall < COOLDOWN_MS) {
            setError('Please wait a moment before trying again')
            return
        }
        setLastCall(now);

        try {
            const subTasks = await fetchSubtasks(item.label);
            onAddSubtasks(item.id, subTasks);
        } catch (err) {
            console.error('Error fetching subtasks:', err);
        } finally {
            setLoadingSubtasks(false);
        }
    }

    return (
        <><li
            className={`task-card ${item.done ? 'task-done' : ''} ${isOverlay ? 'task-overlay' : ''}`}
            ref={setNodeRef}
            style={isOverlay ? {} : style}
            {...attributes}
        >
            {/* drag handle */}
            <span className="drag-handle" {...listeners} aria-label="Drag">⠿</span>

            {/* checkbox */}
            <button
                className="task-check"
                onClick={() => onToggle(item.id)}
                aria-label={item.done ? 'Mark incomplete' : 'Mark complete'}
            >
                {item.done && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>

            {/* label */}
            <span className="task-label">{item.label}</span>



            {/* all action buttons grouped — hover shows them */}
            <div className="task-actions">

                {/* subtask button */}
                {onAddSubtasks && !isOverlay && (
                    <button
                        className="task-subtask-btn"
                        onClick={handleSubtasks}
                        disabled={loadingSubtasks}
                        aria-label="Break into subtasks"
                        title="Break into subtasks"
                    >
                        {loadingSubtasks ? '…' : '⊕'}
                    </button>
                )}

                {/* priority button */}
                <div className="priority-wrap">
                    <button
                        className="priority-dot-btn"
                        onClick={() => setShowPriority(p => !p)}
                        aria-label="Set priority"
                    >
                        <span
                            className="priority-dot"
                            style={{ background: PRIORITY_COLORS[item.priority] || '#ef9f27' }} />
                    </button>

                    {/* priority dropdown */}
                    {showPriority && (
                        <div className="priority-menu">
                            {PRIORITY_LABELS.map(p => (
                                <button
                                    key={p}
                                    className={`priority-option ${item.priority === p ? 'active' : ''}`}
                                    onClick={() => { onPriority(item.id, p); setShowPriority(false); }}
                                >
                                    <span
                                        className="priority-dot"
                                        style={{ background: PRIORITY_COLORS[p] }} />
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* delete button */}
                <button
                    className="task-delete"
                    onClick={() => onDelete(item.id)}
                    aria-label="Delete task"
                >
                    ×
                </button>

            </div>


        </li><div>
                {error && <p className='error-msg'>{error}</p>}
            </div></>
    )
}