import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  loadRecords, getDateKey, getDayGanzhi,
  MOOD_LEVELS, BODY_LEVELS, SLEEP_LEVELS, WEATHER_TYPES
} from '../utils/moodtracker'

// 等级数据映射：id → 得分（从1开始，越高越好）
function levelIndex(levels, id) {
  if (!id) return null
  for (let i = 0; i < levels.length; i++) {
    if (levels[i].id === id) return levels.length - i
  }
  return null
}

export default function Stats({ records }) {
  const [viewMode, setViewMode] = useState('month')
  const [dimension, setDimension] = useState('mood')

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    return d
  })

  const navigate = (dir) => {
    if (viewMode === 'month') {
      let m = viewMonth + dir, y = viewYear
      if (m > 12) { m = 1; y++ }
      if (m < 1) { m = 12; y-- }
      setViewMonth(m)
      setViewYear(y)
    } else {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + dir * 7)
      setWeekStart(d)
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth() + 1)
    }
  }

  // 当前维度的配置
  const dimConfig = useMemo(() => {
    // 返回 {emoji, score}，score 从1(最差)到max(最好)
    const getInfo = (levels, id) => {
      if (!id) return null
      for (let i = 0; i < levels.length; i++) {
        if (levels[i].id === id) {
          return { emoji: levels[i].emoji, score: levels.length - i }
        }
      }
      return null
    }
    switch (dimension) {
      case 'mood': return { levels: MOOD_LEVELS, getInfo: (r) => getInfo(MOOD_LEVELS, r?.mood), label: '心情' }
      case 'body': return { levels: BODY_LEVELS, getInfo: (r) => getInfo(BODY_LEVELS, r?.body), label: '身体' }
      case 'sleep': return { levels: SLEEP_LEVELS, getInfo: (r) => getInfo(SLEEP_LEVELS, r?.sleep), label: '睡眠' }
      case 'weather': return { levels: WEATHER_TYPES, getInfo: (r) => getInfo(WEATHER_TYPES, r?.weather), label: '天气' }
      default: return { levels: MOOD_LEVELS, getInfo: (r) => getInfo(MOOD_LEVELS, r?.mood), label: '心情' }
    }
  }, [dimension])

  const maxIdx = dimConfig.levels.length

  // 构造时间线数据
  const timelineData = useMemo(() => {
    const days = []
    let cursor, end

    if (viewMode === 'week') {
      cursor = new Date(weekStart)
      end = new Date(weekStart)
      end.setDate(end.getDate() + 6)
    } else {
      cursor = new Date(viewYear, viewMonth - 1, 1)
      end = new Date(viewYear, viewMonth, 0)
    }

    while (cursor <= end) {
      const y = cursor.getFullYear(), m = cursor.getMonth() + 1, d = cursor.getDate()
      const key = getDateKey(y, m, d)
      const rec = records[key]
      const info = dimConfig.getInfo(rec)
      days.push({
        key, year: y, month: m, day: d,
        ganzhi: getDayGanzhi(y, m, d).full,
        record: rec,
        idx: info?.score || null,
        emoji: info?.emoji || '·',
        isToday: y === now.getFullYear() && m === now.getMonth()+1 && d === now.getDate(),
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    return days
  }, [records, viewMode, viewYear, viewMonth, weekStart, dimConfig])

  // 统计汇总
  const summary = useMemo(() => {
    const filled = timelineData.filter(d => d.idx !== null).length
    return { filled, total: timelineData.length, pct: timelineData.length ? Math.round(filled / timelineData.length * 100) : 0 }
  }, [timelineData])

  // 颜色映射：index(1~max) → 颜色（1=最差, max=最好）
  const getBarColor = (idx) => {
    if (idx === null) return 'bg-warm-100'
    // 从最差(索引0)到最好(末尾)
    const moodColors = ['bg-mood-worried','bg-mood-anxious','bg-mood-terrible','bg-mood-bad','bg-mood-mid','bg-mood-nice','bg-mood-okay','bg-mood-good','bg-mood-great']
    const bodyColors = ['bg-body-sick','bg-body-sore','bg-body-tired','bg-body-normal','bg-body-energetic']
    const sleepColors = ['bg-sleep-terrible','bg-sleep-poor','bg-sleep-fair','bg-sleep-good','bg-sleep-deep']
    const weatherColors = ['bg-yellow-200','bg-gray-300','bg-gray-400','bg-blue-300','bg-blue-100','bg-gray-200','bg-cyan-200']
    const palette = dimension === 'mood' ? moodColors : dimension === 'body' ? bodyColors : dimension === 'sleep' ? sleepColors : weatherColors
    // idx越小(1)越差→开头, idx越大(max)越好→末尾
    return palette[idx - 1] || 'bg-warm-200'
  }

  const getEmoji = (idx, rec, config) => {
    if (idx === null) return '·'
    const level = (config || dimConfig).levels[idx - 1]
    return level?.emoji || '·'
  }

  const formatTitle = () => {
    if (viewMode === 'week') {
      const end = new Date(weekStart)
      end.setDate(end.getDate() + 6)
      return `${weekStart.getMonth()+1}/${weekStart.getDate()} - ${end.getMonth()+1}/${end.getDate()}`
    }
    return `${viewYear}年${viewMonth}月`
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-cozy-700">统计</h2>
        <div className="flex gap-1 bg-warm-100 rounded-full p-0.5">
          <button onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${viewMode === 'week' ? 'bg-white text-cozy-600 shadow-sm' : 'text-warm-500'}`}>周</button>
          <button onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${viewMode === 'month' ? 'bg-white text-cozy-600 shadow-sm' : 'text-warm-500'}`}>月</button>
        </div>
      </div>

      {/* 维度切换 */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'mood', label: '💭 心情' }, { id: 'body', label: '🏃 身体' },
          { id: 'sleep', label: '🌙 睡眠' }, { id: 'weather', label: '🌤️ 天气' },
        ].map(dim => (
          <button key={dim.id} onClick={() => setDimension(dim.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${dimension === dim.id ? 'bg-cozy-500 text-white shadow-sm' : 'bg-warm-100 text-warm-500 hover:bg-warm-200'}`}>
            {dim.label}
          </button>
        ))}
      </div>

      {/* 导航 */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center text-warm-500 hover:bg-warm-200">◀</button>
        <div className="text-sm font-medium text-cozy-600">{formatTitle()}</div>
        <button onClick={() => navigate(1)} className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center text-warm-500 hover:bg-warm-200">▶</button>
      </div>

      {/* 进度 */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-warm-500 mb-1">
          <span>已记录 {summary.filled}/{summary.total} 天</span>
          <span>{summary.pct}%</span>
        </div>
        <div className="w-full h-2 bg-warm-100 rounded-full overflow-hidden">
          <div className="h-full bg-cozy-400 rounded-full transition-all duration-500" style={{ width: `${summary.pct}%` }} />
        </div>
      </div>

      {/* 走势图 */}
      <div className="overflow-x-auto -mx-1">
        <div className="flex gap-1 min-w-max px-1" style={{ height: '150px' }}>
          {timelineData.map((day) => {
            const barPx = day.idx !== null ? Math.round(day.idx / maxIdx * 80) : 0
            return (
              <div key={day.key} className="flex flex-col items-center gap-0.5 justify-end" style={{ width: viewMode === 'week' ? '44px' : '26px', height: '150px' }}>
                {/* emoji */}
                <div className="text-[10px] leading-tight">{day.emoji}</div>
                {/* 柱 - 用 margin-top 推上来 */}
                <div style={{ height: `${barPx}px`, minHeight: day.idx !== null ? '4px' : '0px', width: '100%', borderRadius: '2px 2px 0 0' }}
                  className={`${getBarColor(day.idx)} ${day.isToday ? 'ring-1 ring-cozy-400' : ''}`} />
                {/* 日期 + 干支 */}
                <div className={`text-[9px] leading-tight ${day.isToday ? 'text-cozy-600 font-bold' : 'text-warm-400'}`}>{day.day}</div>
                <div className="text-[7px] text-warm-300 leading-tight">{day.ganzhi}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 图例 */}
      <div className="mt-3 pt-3 border-t border-warm-100">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-warm-500">
          {[...dimConfig.levels].reverse().map((level, i) => (
            <div key={level.id} className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-sm ${getBarColor(dimConfig.levels.length - i)}`} />
              <span>{level.emoji} {level.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
