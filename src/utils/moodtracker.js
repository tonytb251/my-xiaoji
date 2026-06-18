// 天干地支计算
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

// 计算某天的天干地支
// 基准：1900-01-01 = 甲戌日（天干=甲=0，地支=戌=10）
export function getDayGanzhi(year, month, day) {
  const base = new Date(1900, 0, 1)
  const target = new Date(year, month - 1, day)
  const diff = Math.round((target - base) / 86400000)
  const ganIdx = ((diff % 10) + 10) % 10
  const zhiIdx = ((diff + 10) % 12 + 12) % 12  // 1900-01-01 地支为戌(10)
  return { gan: TIAN_GAN[ganIdx], zhi: DI_ZHI[zhiIdx], full: `${TIAN_GAN[ganIdx]}${DI_ZHI[zhiIdx]}` }
}

// 计算月干支
// 公历月份直接映射：月地支 = month % 12（1月=丑=1）
// 月天干：每年公历1月的起始天干 = (年干 × 2 + 1) % 10，每月+1
export function getMonthGanZhi(year, month) {
  const yearGan = ((year - 4) % 10 + 10) % 10
  const startGan = (yearGan * 2 + 1) % 10
  const monthGan = (startGan + month - 1) % 10
  const monthZhi = month % 12
  return { gan: TIAN_GAN[monthGan], zhi: DI_ZHI[monthZhi], full: `${TIAN_GAN[monthGan]}${DI_ZHI[monthZhi]}` }
}

// 年干支
export function getYearGanZhi(year) {
  const gan = ((year - 4) % 10 + 10) % 10
  const zhi = ((year - 4) % 12 + 12) % 12
  return { gan: TIAN_GAN[gan], zhi: DI_ZHI[zhi], full: `${TIAN_GAN[gan]}${DI_ZHI[zhi]}`, shengXiao: SHENG_XIAO[zhi] }
}

// 获取年月日所有干支信息
export function getDateGanzhiInfo(year, month, day) {
  return {
    year: getYearGanZhi(year),
    month: getMonthGanZhi(year, month),
    day: getDayGanzhi(year, month, day),
    full: `${getYearGanZhi(year).full}年 ${getMonthGanZhi(year, month).full}月 ${getDayGanzhi(year, month, day).full}日`
  }
}

// 取今天的干支信息
export function getTodayGanzhiInfo() {
  const now = new Date()
  return getDateGanzhiInfo(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

// 天气列表
export const WEATHER_TYPES = [
  { id: 'sunny', label: '晴', emoji: '☀️' },
  { id: 'cloudy', label: '多云', emoji: '⛅' },
  { id: 'overcast', label: '阴', emoji: '☁️' },
  { id: 'rainy', label: '雨', emoji: '🌧️' },
  { id: 'snowy', label: '雪', emoji: '🌨️' },
  { id: 'foggy', label: '雾', emoji: '🌫️' },
  { id: 'windy', label: '风', emoji: '🌬️' },
]

// 情绪等级 - id 必须对应 tailwind.config.js 中的 mood 颜色名
export const MOOD_LEVELS = [
  { id: 'great', label: '超嗨的', emoji: '🤩', color: 'bg-mood-great' },
  { id: 'good', label: '舒适', emoji: '😌', color: 'bg-mood-good' },
  { id: 'okay', label: 'luck', emoji: '🍀', color: 'bg-mood-okay' },
  { id: 'nice', label: '不错', emoji: '🙂', color: 'bg-mood-nice' },
  { id: 'mid', label: '一般', emoji: '😐', color: 'bg-mood-mid' },
  { id: 'bad', label: '不好', emoji: '😔', color: 'bg-mood-bad' },
  { id: 'terrible', label: '很差', emoji: '😢', color: 'bg-mood-terrible' },
  { id: 'anxious', label: '烦躁', emoji: '😤', color: 'bg-mood-anxious' },
  { id: 'worried', label: '焦虑', emoji: '😰', color: 'bg-mood-worried' },
]

// 身体感受
export const BODY_LEVELS = [
  { id: 'energetic', label: '精力充沛', emoji: '💪', color: 'bg-body-energetic' },
  { id: 'normal', label: '正常', emoji: '👍', color: 'bg-body-normal' },
  { id: 'tired', label: '疲惫', emoji: '😴', color: 'bg-body-tired' },
  { id: 'sore', label: '酸痛', emoji: '🤕', color: 'bg-body-sore' },
  { id: 'sick', label: '生病', emoji: '🤒', color: 'bg-body-sick' },
]

// 睡眠质量
export const SLEEP_LEVELS = [
  { id: 'deep', label: '很好', emoji: '🛌', color: 'bg-sleep-deep' },
  { id: 'good', label: '还行', emoji: '😴', color: 'bg-sleep-good' },
  { id: 'fair', label: '一般', emoji: '🌙', color: 'bg-sleep-fair' },
  { id: 'poor', label: '不好', emoji: '😫', color: 'bg-sleep-poor' },
  { id: 'terrible', label: '很差', emoji: '🤯', color: 'bg-sleep-terrible' },
]

// 记录存储
const STORAGE_KEY = 'moodtracker_records'

export function loadRecords() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function getDateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function getTodayKey() {
  const now = new Date()
  return getDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

// 每天的数据结构
// {
//   mood: 'great' | 'good' | 'okay' | 'bad' | 'awful',
//   body: 'energetic' | 'normal' | 'tired' | 'sore' | 'sick',
//   sleep: 'deep' | 'good' | 'fair' | 'poor' | 'terrible',
//   weather: 'sunny' | 'cloudy' | ...,
//   note: string,
// }
