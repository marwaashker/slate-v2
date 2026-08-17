// lib/api.js
// all frontend AI calls go through here
// these hit the server, not Gemini directly

export async function fetchDailyBriefing(tasks, onChunk) {
  const res = await fetch('/api/brief', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks }),
  })


  if (!res.ok) throw new Error('Brief request failed')
  if (!res.body) throw new Error('No response body')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    fullText += decoder.decode(value, { stream: true })
  }

  const words = fullText.split(' ');

  for (const word of words) {
    onChunk(word + ' ')
    await new Promise(resolve => setTimeout(resolve, 30))
  }
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

export async function fetchPriority(tasks, onChunk) {
  const res = await fetch('/api/priority', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks }),
  })

  if (!res.ok) throw new Error('Brief request failed')
  if (!res.body) throw new Error('No response body')
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''


  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    fullText += decoder.decode(value, { stream: true })
  }

  const words = fullText.split(' ')
  for (const word of words) {
    onChunk(word + ' ')
    await new Promise(resolve => setTimeout(resolve, 30))
  }

}

export async function fetchSubtasks(label) {
  const res = await fetch('/api/subtasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data
}



export async function fetchChat(columns, history, message, onChunk) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columns, history, message }),
  })

  if (!res.ok) throw new Error('Chat request failed')
  if (!res.body) throw new Error('No response body')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  // collect all chunks first
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    fullText += decoder.decode(value, { stream: true })
  }

  // then simulate word by word
  const words = fullText.split(' ')
  for (const word of words) {
    onChunk(word + ' ')
    await new Promise(resolve => setTimeout(resolve, 30))
  }
}