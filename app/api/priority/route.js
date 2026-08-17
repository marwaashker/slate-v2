import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(req) {
  try {
    const { tasks } = await req.json()

    if (!tasks || tasks.length === 0) {
      return Response.json({ error: 'No tasks' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const taskList = tasks
      .filter(t => !t.done)
      .map(t => `- ${t.label} (${t.priority} priority)`)
      .join('\n')

    if (!taskList) {
      return Response.json({ error: 'All tasks done' }, { status: 400 })
    }

    const prompt = `
You are a productivity assistant inside a todo app called Slate.
The user wants to know what to focus on today.
Write 2-3 sentences max. Be direct and specific about their actual tasks.
Mention the top 2-3 tasks by name and briefly why.
Do not use bullet points or numbered lists. Write naturally.

My tasks for today:
${taskList}
    `

    const result = await model.generateContentStream(prompt)

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) {
            controller.enqueue(new TextEncoder().encode(text))
          }
        }
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      }
    })

  } catch (err) {
    console.error('priority error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}