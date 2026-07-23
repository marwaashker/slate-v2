import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(req) {
  try {
    const { tasks } = await req.json()

    if (!tasks || tasks.length === 0) {
      return Response.json([])
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const taskList = tasks
      .filter(t => !t.done)
      .map(t => `- ${t.label} (${t.priority} priority)`)
      .join('\n')

    if (!taskList) return Response.json([])

    const prompt = `
You are a productivity assistant inside a todo app called Slate.
Return ONLY a valid JSON array — no explanation, no markdown, no backticks.
Pick the top 3 tasks to focus on today.
Use exactly this shape:
[
  { "label": "task title exactly as given", "reason": "one short sentence why" },
  { "label": "task title exactly as given", "reason": "one short sentence why" },
  { "label": "task title exactly as given", "reason": "one short sentence why" }
]
If fewer than 3 tasks return fewer items.
If no tasks return [].

My tasks for today:
${taskList}
    `

    const result = await model.generateContent(prompt)
    const raw = result.response.text()
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return Response.json(parsed)
  } catch (err) {
    console.error('priority error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}