"use client"

export function buildWeek() {
  const weeks = []
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    const label = i === 0
      ? 'Today'
      : d.toLocaleDateString('en-GB', { weekday: 'long' })

    weeks.push({
      id: `day-${i}`,
      label,
      date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }),
      isWeekend,
      tasks: [],
    })
  }
  console.log("weeks", weeks);

  return weeks
}


