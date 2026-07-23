"use client"

import { useState, useEffect } from 'react'
import './app.css';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { buildWeek } from '../utils/buildWeeks';
import Board from './components/board';
import ChatPanel from './components/ChatPanel';
import PrioritySuggestion from './components/PrioritySuggestion';
import DailyBriefing from './components/DailyBriefing';
import TaskItem from './components/taskItem';
import Lottie from '../assets/lottie';
import { fetchDailyBriefing } from './lib/api'




export default function Home() {

  const week = buildWeek()
  const [activeTask, setActiveTask] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [briefing, setBriefing] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true)
  }, [])

  async function fetchBriefing() {
    setBriefOpen(p => !p)
    if (loaded) return // don't call twice
    setLoading(true)
    setError(null)
    try {
      const text = await fetchDailyBriefing(todayTasks)
      setBriefing(text)
      setLoaded(true)
    } catch (err) {
      setError(
        err.message.includes('Too many requests')
          ? 'Too many requests — try again in a moment'
          : 'Could not load briefing'
      )
    } finally {
      setLoading(false);
      setBriefOpen(!briefOpen)
    }
  }



  const [columns, setColumns] = useState(() => {
    if (typeof window === 'undefined') {
      // server side — return default, no localStorage
      return week.map(day => ({ ...day, tasks: [] }))
    }
    const saved = localStorage.getItem('columns')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      } catch (error) {
        console.warn('Failed to parse columns from localStorage:', error)
      }
    }
    // initialise 7 empty columns
    return week.map(day => ({ ...day, tasks: [] }))
  })


  const todayTasks = columns.find(col => col.id === 'day-0').tasks || [];



  function AddTodo(colId, label, priority = 'medium') {
    if (!label || !label.trim()) return;

    setColumns(prev => prev.map(col =>
      col.id === colId
        ? { ...col, tasks: [{ id: Date.now(), label: label, done: false, priority }, ...col.tasks] }
        : col
    ))
  }


  function deleteTodo(taskId) {
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => t.id !== taskId)
    })))
  }


  function toggleDone(taskId) {
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
    })))
  }

  function onPriority(taskId, priority) {
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(t => t.id === taskId ? { ...t, priority } : t)
    })))
  }


  useEffect(() => {
    localStorage.setItem('columns', JSON.stringify(columns))
  }, [columns]);


  //searches all columns and tells you where a task lives
  function findColumnById(taskId) {
    return columns.find(col => col.tasks.some(t => t.id === taskId))
  }

  function onDragStart({ active }) {
    const col = findColumnById(active.id)
    if (!col) return;
    setActiveTask(col.tasks.find(t => t.id === active.id))

  }



  function onDragEnd({ active, over }) {
    setActiveTask(null) // always clear the overlay when drag ends

    if (!over) return

    const draggableTaskId = active.id
    const droppableId = over.id

    const sourceCol = findColumnById(draggableTaskId)
    if (!sourceCol) return // safety check

    const isOverAColumn = columns.some(col => col.id === droppableId)

    // ── SCENARIO 3: dropped on an empty column ───────────────
    if (isOverAColumn) {
      const targetCol = columns.find(col => col.id === droppableId) // ✅ bug 2 fixed
      if (!targetCol) return
      if (sourceCol.id === targetCol.id) return // same column, do nothing

      const task = sourceCol.tasks.find(t => t.id === draggableTaskId)

      setColumns(prev => prev.map(col => {
        if (col.id === sourceCol.id) {
          // remove from old column
          return { ...col, tasks: col.tasks.filter(t => t.id !== draggableTaskId) }
        }
        if (col.id === targetCol.id) {
          // add to top of new column
          return { ...col, tasks: [task, ...col.tasks] }
        }
        return col
      }))

      return
    }

    // ── over.id is a task ID from here on ────────────────────
    const targetCol = findColumnById(droppableId) // now this works — over.id is a task ID
    if (!targetCol) return

    // ── SCENARIO 1: reorder within same column ───────────────
    if (sourceCol.id === targetCol.id) {
      const oldIndex = sourceCol.tasks.findIndex(t => t.id === draggableTaskId)
      const newIndex = sourceCol.tasks.findIndex(t => t.id === droppableId)

      setColumns(prev => prev.map(col => {
        if (col.id !== sourceCol.id) return col
        return { ...col, tasks: arrayMove(col.tasks, oldIndex, newIndex) }
      }))

      return
    }

    // ── SCENARIO 2: different column, dropped on a task ──────
    const task = sourceCol.tasks.find(t => t.id === draggableTaskId)
    const insertIndex = targetCol.tasks.findIndex(t => t.id === droppableId)

    setColumns(prev => prev.map(col => {
      if (col.id === sourceCol.id) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== draggableTaskId) }
      }
      if (col.id === targetCol.id) {
        const newTasks = [...col.tasks]
        newTasks.splice(insertIndex, 0, task)
        return { ...col, tasks: newTasks }
      }
      return col
    }))
  }

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 }
  }))



  function addSubtasks(parentTaskId, subtaskLabels) {
    setColumns(prev => prev.map(col => {
      // find the column that has the parent task
      const parentIndex = col.tasks.findIndex(t => t.id === parentTaskId)
      if (parentIndex === -1) return col // not in this column

      // build subtask objects
      const subtasks = subtaskLabels.map((label, i) => ({
        id: Date.now() + i + 1,
        label,
        done: false,
        priority: 'medium',
      }))

      // insert subtasks right after the parent task
      const newTasks = [...col.tasks]
      newTasks.splice(parentIndex + 1, 0, ...subtasks)

      return { ...col, tasks: newTasks }
    }))
  }




 if (!mounted) return null;

  return (

    <DndContext onDragEnd={onDragEnd} sensors={sensors}
      collisionDetection={closestCorners} onDragStart={onDragStart}
    >

      <div className="app">
        {/* topbar — title + focus button centered */}
        <Lottie
          loop={false}
          autoplay={false}
        />
        <div className="topbar">
          {/* <h1 className="app-title">Mañana</h1> */}
          <h1 className="app-title">Slate.</h1>
          <div className="top-actions">
            <PrioritySuggestion todayTasks={todayTasks} />
          </div>

        </div>

        <div style={{ marginBottom: '16px' }}>
        </div>
        {/* body — brief sidebar + board */}
        <div className="body-area">
          {/* brief toggle button on the left */}
          <div className="brief-sidebar">
            <button className="brief-btn" onClick={fetchBriefing}>
              ≡ brief
            </button>
          </div>

          {/* brief drawer slides in */}
          <div className={`brief-drawer ${briefOpen ? 'open' : ''}`}>
            <div className="brief-inner">
              <DailyBriefing todayTasks={todayTasks} setBriefOpen={setBriefOpen} briefOpen={briefOpen} briefing={briefing} loading={loading} error={error} />
            </div>
          </div>
          <div className="board-wrap">
            <div className="board-scroll-wrap" >
              <div className="board-panel">
                <Board
                  columns={columns}
                  onAdd={AddTodo}
                  onToggle={toggleDone}
                  onDelete={deleteTodo}
                  todayTasks={todayTasks}
                  onAddSubtasks={addSubtasks}
                  onPriority={onPriority}
                />
              </div>
            </div>
          </div>


        </div>


      </div>
      {/* floating chat button */}
      <button className="chat-fab" onClick={() => setIsChatOpen(true)}>✦</button>

      <ChatPanel
        columns={columns}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <DragOverlay>
        {activeTask ? (
          <div style={{ width: '280px' }}>
            <TaskItem item={activeTask} onToggle={() => { }} onDelete={() => { }} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
      <footer className="footer">
        <span>Made by <span>Marwa Elashker</span> </span>
      </footer>
    </DndContext >
  )

}
