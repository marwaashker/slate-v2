import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(req) {
    try {
        const { label } = await req.json()

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = `
You are a productivity assistant inside a todo app called Slate.
The user gives you one task and wants it broken into subtasks.
Return ONLY a valid JSON array of strings — no explanation, no markdown, no backticks.
Maximum 4 subtasks. Keep each one short and actionable.
Example: ["Research the topic", "Write an outline", "Write first draft", "Review and edit"]

Break this task into subtasks: "${label}"
    `

        const result = await model.generateContent(prompt)
        const raw = result.response.text()
        const cleaned = raw.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleaned)

        return Response.json(parsed)
    } catch (err) {
        console.error('subtasks error:', err)
        return Response.json({ error: err.message }, { status: 500 })
    }
}