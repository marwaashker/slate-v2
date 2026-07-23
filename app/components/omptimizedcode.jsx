// TaskList.jsx — works but has performance problems
"use client"

import { useState, useMemo, useCallback, memo } from 'react'


// wrap with memo — only re-renders if props change
const TaskItem = memo(function TaskItem({ task, onDelete }) {
  console.log('TaskItem rendered:', task.title)
  return (
    <div>
      <span>{task.title}</span>
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </div>
  )
})


export default function TaskList() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Buy groceries', done: false },
    { id: 2, title: 'Call Ahmed', done: true },
    { id: 3, title: 'Review PR', done: false },
  ])
  const [count, setCount] = useState(0)


  // only recalculates when tasks changes
  const pendingTasks = useMemo( () => tasks.filter(t => !t.done),
    [tasks]
  );

// expensive calculation

const statsnotFixed = tasks.reduce((acc, task) => {
  let total = 0
  for (let i = 0; i < 1000000; i++) total++
  return { total: tasks.length, done: tasks.filter(t => t.done).length }
}, [tasks])

// fix 2 — cache the expensive calculation
// only recalculates when tasks changes
const stats = useMemo(() => {
  let total = 0
  for (let i = 0; i < 1000000; i++) total++
  return { total: tasks.length, done: tasks.filter(t => t.done).length }
}, [tasks])

// delete handler passed to child
const handleDelete = (id) => {
  setTasks(prev => prev.filter(t => t.id !== id))
}
// fix 3 — stable function reference
// memo on TaskItem only works if this doesn't change

const handleCount = useCallback((c) => {
  setCount(c => c + 1)
}, [c])

return (
  <div>
    <p>Total: {stats.total} | Done: {stats.done}</p>
    <button onClick={handleCount}>
      Re-render ({count})
    </button>
    {pendingTasks.map(task => (
      <TaskItem key={task.id} task={task} onDelete={handleDelete} />
    ))}
  </div>
)
}




async function fetchDashboardData(userId) {
  const [user, orders, notifications] = await promise.all([
    fetch(`/api/users/${userId}`).then(res => res.json()),
    fetch(`/api/orders/${userId}`).then(res => res.json()),
    fetch(`/api/notifications/${userId}`).then(res => res.json()),
  ])

  return {
    user,
    orders,
    notifications
  };
}
async function fetchDashboardData(userId) {
  const [user, orders, notifications] = await promise.all([
    fetch(`/api/users/${userId}`).then(res => res.json()),
    fetch(`/api/orders/${userId}`).then(res => res.json()),
    fetch(`/api/notifications/${userId}`).then(res => res.json()),
  ]);

  return { user, orders, notifications };
}

async function getUserProfile(userId) {
  try {
    const res = await fetch(`/api/users/${userId}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function updateOrderStatus(orderId, status) {

  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
  if (res.ok) {
    const data = await res.json();
    return data;
  }
  console.error('error message')
}

function loadUserData(userId) {
  let userData = [];
  const fetchData = fetchDashboardData(userId);
  if (fetchData) {
    userData.push(fetchData)
  }

  return userData;
}