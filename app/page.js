"use client"

import { useState, useEffect } from 'react'
import { UserButton } from '@clerk/nextjs'
import { useSupabase } from './hooks/useSupabase'
import { useUser } from '@clerk/nextjs'
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
  const supabase = useSupabase();
  const { user } = useUser();



  useEffect(() => {
    setMounted(true)
  }, [])

  async function fetchBriefingData() {
    setBriefOpen(p => !p)
    if (loaded) return // don't call twice
    setLoading(true)
    setError(null)
    try {
      await fetchDailyBriefing(todayTasks, (chunk) => {
        // this runs every time a new chunk arrives
        // we append it to the existing text
        setBriefing(prev => prev + chunk)
      })
      setLoaded(true)
    } catch (err) {
      setError('Could not load briefing — try again')
      console.error(err)
    } finally {
      setLoading(false)
      // setBriefOpen(!briefOpen) 
    }
  }



  // const [columns, setColumns] = useState(() => {
  //   if (typeof window === 'undefined') {
  //     // server side — return default, no localStorage
  //     return week.map(day => ({ ...day, tasks: [] }))
  //   }
  //   const saved = localStorage.getItem('columns')
  //   if (saved) {
  //     try {
  //       const parsed = JSON.parse(saved)
  //       if (Array.isArray(parsed)) return parsed
  //     } catch (error) {
  //       console.warn('Failed to parse columns from localStorage:', error)
  //     }
  //   }
  //   // initialise 7 empty columns
  //   return week.map(day => ({ ...day, tasks: [] }))
  // })

  const [columns, setColumns] = useState(() => {
    return week.map(day => ({ ...day, tasks: [] }))
  })


  useEffect(() => {
    async function loadTasks() {
      if (!user) return

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true })

      if (error) {
        console.error('Error loading tasks:', error)
        return
      }

      // distribute tasks into their correct columns
      setColumns(prev => prev.map(col => ({
        ...col,
        tasks: data
          .filter(t => t.column_id === col.id)
          .map(t => ({
            id: t.id,
            label: t.label,
            priority: t.priority,
            done: t.done,
          }))
      })))
    }

    loadTasks()
  }, [user?.id])


  const todayTasks = columns.find(col => col.id === 'day-0').tasks || [];



  async function AddTodo(colId, label, priority = 'medium') {
    if (!label || !label.trim()) return;
    if (!user) return;

    const newTask = {
      label: label.trim(),
      priority,
      done: false,
      column_id: colId,
      user_id: user.id,
      position: 0,
    }
    const { data, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single()

    if (error) {
      console.error('Error adding task:', error)
      return
    }



    setColumns(prev => prev.map(col =>
      col.id === colId
        ? {
          ...col, tasks: [{
            id: data.id,
            label: data.label,
            priority: data.priority,
            done: data.done,
          }, ...col.tasks]
        }
        : col
    ))
  }


  async function deleteTodo(taskId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Error deleting task:', error)
      return
    }

    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => t.id !== taskId)
    })))
  }


  async function toggleDone(taskId) {
    const task = columns
      .flatMap(col => col.tasks)
      .find(t => t.id === taskId)

    if (!task) return

    const { error } = await supabase
      .from('tasks')
      .update({ done: !task.done })
      .eq('id', taskId)

    if (error) {
      console.error('Error toggling task:', error)
      return
    }
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
    })))
  }

  async function onPriority(taskId, priority) {
    const { error } = await supabase
      .from('tasks')
      .update({ priority })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating priority:', error)
      return
    }
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(t => t.id === taskId ? { ...t, priority } : t)
    })))
  }




  //searches all columns and tells you where a task lives
  function findColumnById(taskId) {
    return columns.find(col => col.tasks.some(t => t.id === taskId))
  }

  function onDragStart({ active }) {
    const col = findColumnById(active.id)
    if (!col) return;
    setActiveTask(col.tasks.find(t => t.id === active.id))

  }



  async function onDragEnd({ active, over }) {
    setActiveTask(null)

    if (!over) return

    const draggableTaskId = active.id
    const droppableId = over.id

    const sourceCol = findColumnById(draggableTaskId)
    if (!sourceCol) return

    const isOverAColumn = columns.some(col => col.id === droppableId)

    // ── SCENARIO 3: dropped on an empty column ───────────────
    if (isOverAColumn) {
      const targetCol = columns.find(col => col.id === droppableId)
      if (!targetCol) return
      if (sourceCol.id === targetCol.id) return

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
      await supabase
        .from('tasks')
        .update({ column_id: targetCol.id, position: 0 })
        .eq('id', draggableTaskId)

      return
    }

    // ── over.id is a task ID from here on ────────────────────
    const targetCol = findColumnById(droppableId)
    if (!targetCol) return

    // ── SCENARIO 1: reorder within same column ───────────────
    if (sourceCol.id === targetCol.id) {
      const oldIndex = sourceCol.tasks.findIndex(t => t.id === draggableTaskId)
      const newIndex = sourceCol.tasks.findIndex(t => t.id === droppableId)
      const reordered = arrayMove(sourceCol.tasks, oldIndex, newIndex);

      setColumns(prev => prev.map(col => {
        if (col.id !== sourceCol.id) return col
        return { ...col, tasks: arrayMove(col.tasks, oldIndex, newIndex) }
      }))
      await Promise.all(
        reordered.map((task, index) =>
          supabase
            .from('tasks')
            .update({ position: index })
            .eq('id', task.id)
        )
      )

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
    await supabase
      .from('tasks')
      .update({ column_id: targetCol.id, position: insertIndex })
      .eq('id', draggableTaskId)
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
        <Lottie
          loop={false}
          autoplay={false}
        />

        <div className="topbar">
          <div className='flex flex-row'>
            <div className='m-auto'>
              <h1 className="app-title">Slate.</h1>
              <PrioritySuggestion todayTasks={todayTasks} />

            </div>



          </div>
          <div className='signin-btn'>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>



        </div>

        <div style={{ marginBottom: '16px' }}>
        </div>

        <div className="body-area">

          <div className="brief-sidebar">
            <button className="brief-btn" onClick={fetchBriefingData}>
              ≡ brief
            </button>
          </div>


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
