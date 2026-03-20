import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

const IST = 'Asia/Kolkata'

export const fmt = (d) => {
  if (!d) return '—'
  return dayjs.utc(d).tz(IST).format('DD MMM YYYY')
}

export const fmtDateTime = (d) => {
  if (!d) return '—'
  return dayjs.utc(d).tz(IST).format('DD MMM YYYY, h:mm A')
}

export const fromNow = (d) => {
  if (!d) return '—'
  return dayjs.utc(d).tz(IST).fromNow()
}

export const today = () => dayjs().tz(IST).format('YYYY-MM-DD')

export const toApiDate = (d) => {
  if (!d) return null
  return dayjs(d).format('YYYY-MM-DD')
}