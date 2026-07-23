// lib/api.js
// all frontend AI calls go through here
// these hit YOUR server, not Gemini directly

export async function fetchDailyBriefing(tasks) {
  const res = await fetch('/api/brief', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.text
}

export async function fetchParseTask(input) {
  const res = await fetch('/api/parse-task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input,
      clientDate: new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data // { label, priority, day }
}

export async function fetchPriority(tasks) {
  const res = await fetch('/api/priority', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data // array of { label, reason }
}

export async function fetchSubtasks(label) {
  const res = await fetch('/api/subtasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data // array of strings
}

export async function fetchChat(columns, history, message) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columns, history, message }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.text
}