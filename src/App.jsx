import { useState, useEffect, useMemo } from 'react'
import Calendar from './components/Calendar'
import DayRecord from './components/DayRecord'
import Stats from './components/Stats'
import { loadRecords, saveRecords, getTodayKey, getDateKey } from './utils/moodtracker'

export default function App() {
  const [records, setRecords] = useState({})
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
  })
  const [showRecord, setShowRecord] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    setRecords(loadRecords())
  }, [])

  const saveRecord = (dateKey, data) => {
    const updated = { ...records, [dateKey]: data }
    setRecords(updated)
    saveRecords(updated)
  }

  const clearRecord = (dateKey) => {
    const updated = { ...records }
    delete updated[dateKey]
    setRecords(updated)
    saveRecords(updated)
  }

  const dateKey = getDateKey(selectedDate.year, selectedDate.month, selectedDate.day)
  const currentRecord = records[dateKey] || null

  const handleDayClick = (year, month, day) => {
    setSelectedDate({ year, month, day })
    setShowRecord(true)
  }

  const monthKey = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}`

  // 当月记录数统计
  const monthStats = useMemo(() => {
    let filled = 0
    Object.entries(records).forEach(([key, rec]) => {
      if (key.startsWith(monthKey) && rec.mood) filled++
    })
    return { filled, total: new Date(selectedDate.year, selectedDate.month, 0).getDate() }
  }, [records, monthKey])

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-white">
      <div className="page-container">
        {/* 顶栏 */}
        <div className="flex items-center justify-between mb-6 px-1">
          <h1 className="text-2xl font-bold text-cozy-700">小记</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`w-9 h-9 rounded-full shadow-sm flex items-center justify-center transition-all ${showStats ? 'bg-cozy-500 text-white' : 'bg-white/80 text-warm-500 hover:bg-warm-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </button>
            <button
              onClick={() => setShowAbout(!showAbout)}
              className="w-9 h-9 rounded-full bg-white/80 shadow-sm flex items-center justify-center text-warm-500 hover:bg-warm-100 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 关于信息 */}
        {showAbout && (
          <div className="card mb-6 text-sm text-warm-600 animate-fadeIn">
            <p className="mb-1">每天记录你的状态，日子看得见。</p>
            <p className="text-warm-400 text-xs">数据只存在你的手机里，不上传任何服务器。</p>
          </div>
        )}

        {/* 统计 */}
        <div className="flex justify-between items-center mb-4 px-1">
          <div className="text-sm text-warm-500">
            {selectedDate.year}年{selectedDate.month}月
          </div>
          <div className="text-xs text-warm-400 bg-white/60 rounded-full px-3 py-1">
            已记 {monthStats.filled}/{monthStats.total} 天
          </div>
        </div>

        {/* 统计模块 */}
        {showStats && <Stats records={records} />}

        {/* 日历 */}
        <Calendar
          year={selectedDate.year}
          month={selectedDate.month}
          records={records}
          onDayClick={handleDayClick}
        />

        {/* 图例 */}
        <div className="flex gap-4 justify-center mt-4 text-xs text-warm-500">
          <div className="flex items-center gap-1.5">
            <span className="legend-dot bg-mood-great"></span>
            <span>心情</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="legend-dot bg-body-energetic"></span>
            <span>身体</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="legend-dot bg-sleep-deep"></span>
            <span>睡眠</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>☀️</span>
            <span>天气</span>
          </div>
        </div>

        {/* 今日快捷入口 */}
        <button
          onClick={() => handleDayClick(selectedDate.year, selectedDate.month, selectedDate.day)}
          className="btn-primary mt-6"
        >
          {currentRecord ? '查看今日记录' : '记录今天的状态'}
        </button>
      </div>

      {/* 记录弹窗 */}
      {showRecord && (
        <DayRecord
          year={selectedDate.year}
          month={selectedDate.month}
          day={selectedDate.day}
          record={currentRecord}
          onSave={(data) => {
            saveRecord(dateKey, data)
            setShowRecord(false)
          }}
          onClear={() => {
            clearRecord(dateKey)
            setShowRecord(false)
          }}
          onClose={() => setShowRecord(false)}
        />
      )}
    </div>
  )
}
