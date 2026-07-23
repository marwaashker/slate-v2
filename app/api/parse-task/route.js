import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(req) {
    try {
        const { input, timeZone } = await req.json()

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
        const today = new Date()
        const dayNames = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today)
            d.setDate(today.getDate() + i)
            return i === 0
                ? 'Today'
                : d.toLocaleDateString('en-GB', { weekday: 'long', timeZone: timeZone || 'Asia/Riyadh' })
        })


        const prompt = `
You are a task parser for a productivity app called Slate.
The user describes a task in natural language.
Return ONLY a valid JSON object — no explanation, no markdown, no backticks.
Use exactly this shape:
{
  "label": "clean task title",
  "priority": "high" | "medium" | "low",
  "day": "one of the exact day names listed below"
}
Available days (use exact spelling):
${dayNames.join(', ')}

Rules:
- label: clean and concise, remove time references
- priority: default to "medium" if not mentioned
- day: default to "today" if not mentioned, always lowercase
- if user says "urgent", "asap", "important" → high priority
- "tomorrow" from user → use the second day in the list (${dayNames[1]})
- "next week" → use the last day in the list
- always use exact day name from the list above

Parse this: "${input}"
    `

        const result = await model.generateContent(prompt)
        const raw = result.response.text()
        const cleaned = raw.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleaned);


        return Response.json(parsed);

    } catch (err) {
        console.error('parse-task error:', err)
        return Response.json({ error: err.message }, { status: 500 })
    }
}