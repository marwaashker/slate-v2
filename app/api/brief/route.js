import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(req) {
    try {
        const { tasks } = await req.json()

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = `
You are a productivity assistant inside a todo app called Slate.
The user gives you their task list for today.
Write a short morning briefing — maximum 3 sentences.
Be direct, warm, and specific about their actual tasks.
Do not use bullet points. Do not say "Here is your briefing".
Just write the briefing naturally as if talking to them.

My tasks for today:
${tasks.length === 0
                ? 'No tasks yet.'
                : tasks.map(t => `- ${t.label} (${t.priority} priority${t.done ? ', done' : ''})`).join('\n')
            }
    `

        const result = await model.generateContent(prompt)
        const text = result.response.text()

        return Response.json({ text })
    } catch (err) {
        console.error('brief error:', err)
        return Response.json({ error: err.message }, { status: 500 })
    }
}