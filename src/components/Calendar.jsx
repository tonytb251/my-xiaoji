import { useMemo } from 'react'
import { getDateGanzhiInfo, getDayGanzhi, getDateKey, MOOD_LEVELS, BODY_LEVELS, SLEEP_LEVELS, WEATHER_TYPES } from '../utils/moodtracker'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function getMoodColor(moodId) {
  const found = MOOD_LEVELS.find(m => m.id === moodId)
  return found ? found.color.replace('bg-', '') : null
}
function getBodyColor(bodyId) {
  const found = BODY_LEVELS.find(b => b.id === bodyId)
  return found ? found.color.replace('bg-', '') : null
}
function getSleepColor(sleepId) {
  const found = SLEEP_LEVELS.find(s => s.id === sleepId)
  return found ? found.color.replace('bg-', '') : null
}
function getWeatherEmoji(weatherId) {
  const found = WEATHER_TYPES.find(w => w.id === weatherId)
  return found ? found.emoji : null
}

export default function Calendar({ year, month, records, onDayClick }) {
  const today = new Date()

  const days = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const startWeekday = firstDay.getDay()
    const totalDays = lastDay.getDate()

    // 上一个月的末尾
    const prevMonthLast = new Date(year, month - 1, 0).getDate()

    const cells = []

    // 空白填充
    for (let i = startWeekday - 1; i >= 0; i--) {
      cells.push({ year, month: month - 1, day: prevMonthLast - i, isOtherMonth: true })
    }

    for (let d = 1; d <= totalDays; d++) {
      cells.push({ year, month, day: d, isOtherMonth: false })
    }

    // 填充到最后一周
    const remaining = 7 - (cells.length % 7)
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        cells.push({ year: month === 12 ? year + 1 : year, month: month === 12 ? 1 : month + 1, day: d, isOtherMonth: true })
      }
    }

    return cells
  }, [year, month])

  return (
    <div className="card">
      {/* 干支标题 */}
      <div className="text-center mb-4">
        <div className="text-lg font-semibold text-cozy-600">
          {year}年{month}月
        </div>
        <div className="text-xs text-warm-400 mt-0.5">
          {getDateGanzhiInfo(year, month, 1).full} — {getDateGanzhiInfo(year, month, new Date(year, month, 0).getDate()).full}
        </div>
      </div>

      {/* 星期行 */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-xs text-warm-400 py-1 font-medium">
            {w}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, idx) => {
          const key = getDateKey(cell.year, cell.month, cell.day)
          const record = records[key]
          const isToday = cell.year === today.getFullYear() && cell.month === today.getMonth() + 1 && cell.day === today.getDate()

          // 记录颜色的点
          const dots = []
          if (record) {
            if (record.mood) dots.push(getMoodColor(record.mood))
            if (record.body) dots.push(getBodyColor(record.body))
            if (record.sleep) dots.push(getSleepColor(record.sleep))
            if (record.weather) dots.push(null) // 天气用 emoji 表示
          }

          // 干支
          const ganzhi = !cell.isOtherMonth ? getDayGanzhi(cell.year, cell.month, cell.day) : null
          const isWeekend = idx % 7 === 0 || idx % 7 === 6

          return (
            <div
              key={idx}
              onClick={() => onDayClick(cell.year, cell.month, cell.day)}
              className={`calendar-cell ${cell.isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${record ? 'bg-white' : 'hover:bg-warm-50'}`}
            >
              {/* 上部分：日期 */}
              <div className={`text-xs font-semibold leading-tight ${isToday ? 'text-cozy-600' : isWeekend ? 'text-red-400' : 'text-cozy-800'}`}>
                {cell.day}
              </div>
              {/* 中部分：干支 */}
              {ganzhi && (
                <div className="text-[9px] leading-tight text-warm-300 mt-0.5">
                  {ganzhi.full}
                </div>
              )}
              {/* 下部分：状态点 */}
              <div className="flex gap-[2px] mt-0.5">
                {dots.map((color, ci) => (
                  color ? (
                    <div key={ci} className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
                  ) : (
                    <span key={ci} className="text-[8px] leading-none">{getWeatherEmoji(record?.weather)}</span>
                  )
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
