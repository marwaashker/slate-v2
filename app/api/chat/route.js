import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(req) {
  try {
    const { columns, history, message } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const taskContext = columns
      .map(col => {
        if (col.tasks.length === 0) return null
        const taskLines = col.tasks
          .map(t => `  - ${t.label} (${t.priority} priority${t.done ? ', done' : ''})`)
          .join('\n')
        return `${col.label} (${col.date}):\n${taskLines}`
      })
      .filter(Boolean)
      .join('\n\n')

    const historyText = history
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n')

    const prompt = `
You are a productivity assistant inside a todo app called Slate.
The user will ask you questions about their tasks.
Be concise and direct. Maximum 3 sentences per reply.
Never make up tasks that aren't in the list.

Here are all the user's tasks:
${taskContext || 'No tasks yet.'}

${historyText ? `Previous conversation:\n${historyText}\n` : ''}
User: ${message}
    `

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return Response.json({ text })
  } catch (err) {
    console.error('chat error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}