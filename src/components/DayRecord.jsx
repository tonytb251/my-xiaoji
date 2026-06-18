import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getDateGanzhiInfo, getDateKey,
  MOOD_LEVELS, BODY_LEVELS, SLEEP_LEVELS, WEATHER_TYPES
} from '../utils/moodtracker'

export default function DayRecord({ year, month, day, record, onSave, onClear, onClose }) {
  const [mood, setMood] = useState(record?.mood || null)
  const [body, setBody] = useState(record?.body || null)
  const [sleep, setSleep] = useState(record?.sleep || null)
  const [weather, setWeather] = useState(record?.weather || null)
  const [note, setNote] = useState(record?.note || '')
  const [saved, setSaved] = useState(false)

  const hasRecord = !!(record?.mood || record?.body || record?.sleep || record?.weather || record?.note)

  const ganzhi = getDateGanzhiInfo(year, month, day)

  const handleSave = () => {
    onSave({ mood, body, sleep, weather, note: note.trim() || null })
    setSaved(true)
    setTimeout(onClose, 600)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        {/* 背景遮罩 */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

        {/* 面板 */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-warm-50 rounded-t-3xl sm:rounded-3xl p-6 pb-8"
        >
          {/* 日期头部 */}
          <div className="text-center mb-6">
            <div className="text-lg font-bold text-cozy-700">
              {year}年{month}月{day}日
            </div>
            <div className="text-sm text-warm-400 mt-1">
              {ganzhi.full}
            </div>
          </div>

          {/* 情绪选择 */}
          <Section title="心情" emoji="💭">
            <div className="grid grid-cols-3 gap-2">
              {MOOD_LEVELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`selector-btn ${mood === m.id ? 'selected' : ''}`}
                  style={mood === m.id ? { borderColor: m.color.replace('bg-', '#') } : {}}
                >
                  <div className="text-xl mb-0.5">{m.emoji}</div>
                  <div className="text-[9px] text-warm-500">{m.label}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* 身体感受 */}
          <Section title="身体" emoji="🏃">
            <div className="grid grid-cols-5 gap-2">
              {BODY_LEVELS.map(b => (
                <button
                  key={b.id}
                  onClick={() => setBody(b.id)}
                  className={`selector-btn ${body === b.id ? 'selected' : ''}`}
                  style={body === b.id ? { borderColor: b.color.replace('bg-', '#') } : {}}
                >
                  <div className="text-2xl mb-1">{b.emoji}</div>
                  <div className="text-[10px] text-warm-500">{b.label}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* 睡眠质量 */}
          <Section title="睡眠" emoji="🌙">
            <div className="grid grid-cols-5 gap-2">
              {SLEEP_LEVELS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSleep(s.id)}
                  className={`selector-btn ${sleep === s.id ? 'selected' : ''}`}
                  style={sleep === s.id ? { borderColor: s.color.replace('bg-', '#') } : {}}
                >
                  <div className="text-2xl mb-1">{s.emoji}</div>
                  <div className="text-[10px] text-warm-500">{s.label}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* 天气 */}
          <Section title="天气" emoji="🌤️">
            <div className="grid grid-cols-7 gap-2">
              {WEATHER_TYPES.map(w => (
                <button
                  key={w.id}
                  onClick={() => setWeather(w.id)}
                  className={`selector-btn ${weather === w.id ? 'selected' : ''}`}
                >
                  <div className="text-2xl mb-1">{w.emoji}</div>
                  <div className="text-[10px] text-warm-500">{w.label}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* 备注 */}
          <Section title="备注" emoji="📝" last>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="今天有什么想记下来的…"
              className="w-full rounded-2xl bg-white border border-warm-200 px-4 py-3 text-sm text-cozy-800 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-cozy-300 focus:border-transparent transition-all resize-none"
              rows={3}
            />
          </Section>

          {/* 按钮 */}
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-white text-warm-500 font-medium border border-warm-200 hover:bg-warm-100 transition-all">
              取消
            </button>
            {hasRecord && (
              <button
                onClick={() => onClear()}
                className="py-3 px-4 rounded-2xl bg-red-50 text-red-400 font-medium border border-red-100 hover:bg-red-100 transition-all text-sm"
              >
                清空
              </button>
            )}
            <button
              onClick={handleSave}
              className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
                mood || body || sleep || weather || note.trim()
                  ? 'bg-cozy-500 text-white shadow-lg shadow-cozy-200/50 hover:bg-cozy-600 active:scale-95'
                  : 'bg-warm-200 text-warm-400'
              }`}
              disabled={!mood && !body && !sleep && !weather && !note.trim()}
            >
              {saved ? '✓ 已保存' : '保存'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Section({ title, emoji, children, last }) {
  return (
    <div className={`${last ? '' : 'mb-5'}`}>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-base">{emoji}</span>
        <span className="text-sm font-medium text-cozy-600">{title}</span>
      </div>
      {children}
    </div>
  )
}
