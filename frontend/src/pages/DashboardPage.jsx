// ── frontend/src/pages/DashboardPage.jsx ────────────────────────
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Button, Segmented } from 'antd'
import {
  FileAddOutlined, ClockCircleOutlined, FireOutlined,
  ExclamationCircleOutlined, ArrowRightOutlined,
} from '@ant-design/icons'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip,
} from 'recharts'
import dayjs from 'dayjs'
import { useAuthStore } from '../store/authStore'
import { isAdmin, isRM } from '../utils/roleUtils'
import { useVisibleUsers } from '../hooks/useUsers'
import { useDailyStatus, useMyReports } from '../hooks/useReports'
import { today } from '../utils/dateUtils'
import LoadingSpinner from '../components/common/LoadingSpinner'

const { Text } = Typography

const INDIGO = '#5B6AF0'
const AMBER  = '#F59E0B'
const GREEN  = '#22C55E'
const RED    = '#EF4444'
const BORDER = '#f0f0f0'
const MUTED  = '#9a9a9a'
const INK    = '#1a1a1a'

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')

const RANGE_OPTIONS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

const RANGE_CAPTIONS = {
  daily: 'Tasks and hours, last 14 days',
  weekly: 'Tasks and hours, last 8 weeks',
  monthly: 'Tasks and hours, last 6 months',
}

const bucketTotals = (reps) => {
  const tasks = reps.reduce((s, r) => s + (r.tasks?.length || 0), 0)
  const hours = parseFloat(
    reps.reduce((s, r) =>
      s + (r.tasks?.reduce((h, t) => h + (Number(t.time_spent_hours) || 0), 0) || 0), 0
    ).toFixed(1)
  )
  return { tasks, hours }
}

// ── KPI Card ─────────────────────────────────────────────────────
function KpiCard({ label, value, unit, footerIcon, footerText, accent }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: `0.5px solid ${BORDER}`,
      padding: '16px 18px', height: '100%', display: 'flex', flexDirection: 'column',
    }}>
      <Text style={{
        fontSize: 11, color: MUTED, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 10,
      }}>
        {label}
      </Text>
      <div style={{ lineHeight: 1, marginBottom: 4, flex: 1 }}>
        <span style={{ fontSize: 30, fontWeight: 500, color: INK }}>{value}</span>
        {unit && <span style={{ fontSize: 15, color: MUTED, marginLeft: 6 }}>{unit}</span>}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 11.5, color: accent || MUTED,
      }}>
        {footerIcon}{footerText}
      </div>
    </div>
  )
}

// ── Line chart tooltip ────────────────────────────────────────────
const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: `1px solid ${BORDER}`,
      padding: '10px 14px', borderRadius: 8,
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    }}>
      <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#262626', fontSize: 13 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ margin: '2px 0', color: p.color, fontSize: 13 }}>
          {p.name}: <strong>{p.value}{p.dataKey === 'hours' ? ' hrs' : ''}</strong>
        </p>
      ))}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const nav                = useNavigate()
  const [range, setRange]  = useState('weekly')
  const { user }           = useAuthStore()
  const { data: allUsers } = useVisibleUsers()
  const canSeeTeam         = isAdmin(user) || isRM(user, allUsers)
  const { data: status,    isLoading: statusLoading  } = useDailyStatus(today(), canSeeTeam)
  const { data: myReports, isLoading: reportsLoading } = useMyReports()

  const todayStr = today()
  const todayRep = myReports?.find(r => r.report_date === todayStr)

  // ── KPI ──────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    if (!myReports) return { monthTasks: 0, todayTasks: 0, monthHours: 0, todayHours: 0, streak: 0 }

    const thisMonth = dayjs().format('YYYY-MM')
    const monthReps = myReports.filter(r => r.report_date?.startsWith(thisMonth))

    const tasks = (reps) => reps.reduce((s, r) => s + (r.tasks?.length || 0), 0)
    const hours = (reps) => parseFloat(
      reps.reduce((s, r) =>
        s + (r.tasks?.reduce((h, t) => h + (Number(t.time_spent_hours) || 0), 0) || 0), 0
      ).toFixed(1)
    )

    // consecutive-day streak, counting back from today (or yesterday if today isn't logged yet)
    const reportDates = new Set(myReports.map(r => r.report_date))
    let cursor = dayjs(todayStr)
    if (!reportDates.has(todayStr)) cursor = cursor.subtract(1, 'day')
    let streak = 0
    while (reportDates.has(cursor.format('YYYY-MM-DD'))) {
      streak += 1
      cursor = cursor.subtract(1, 'day')
    }

    return {
      monthTasks: tasks(monthReps),
      todayTasks: todayRep ? tasks([todayRep]) : 0,
      monthHours: hours(monthReps),
      todayHours: todayRep ? hours([todayRep]) : 0,
      streak,
    }
  }, [myReports, todayStr, todayRep])

  // ── Team status breakdown ──────────────────────────────────────────
  const statusData = useMemo(() => {
    if (!status) return []
    return [
      { name: 'Submitted', value: status.filter(s => s.status === 'SUBMITTED').length, color: GREEN },
      { name: 'Late',      value: status.filter(s => s.status === 'LATE'     ).length, color: AMBER },
      { name: 'Missing',   value: status.filter(s => s.status === 'MISSING'  ).length, color: RED   },
    ]
  }, [status])

  const statusTotal = status?.length || 0

  // ── Activity trend (daily / weekly / monthly) ───────────────────────
  const chartData = useMemo(() => {
    const reports = myReports || []

    if (range === 'daily') {
      return Array.from({ length: 14 }, (_, i) => {
        const day  = dayjs().subtract(13 - i, 'day')
        const reps = reports.filter(r => r.report_date === day.format('YYYY-MM-DD'))
        return { label: day.format('MMM D'), ...bucketTotals(reps) }
      })
    }

    if (range === 'monthly') {
      return Array.from({ length: 6 }, (_, i) => {
        const start = dayjs().subtract(5 - i, 'month').startOf('month')
        const end   = start.endOf('month')
        const reps  = reports.filter(r => {
          const d = dayjs(r.report_date)
          return !d.isBefore(start) && !d.isAfter(end)
        })
        return { label: start.format('MMM YYYY'), ...bucketTotals(reps) }
      })
    }

    // weekly (default)
    return Array.from({ length: 8 }, (_, i) => {
      const start = dayjs().subtract(7 - i, 'week').startOf('week')
      const end   = start.endOf('week')
      const reps  = reports.filter(r => {
        const d = dayjs(r.report_date)
        return !d.isBefore(start) && !d.isAfter(end)
      })
      return { label: start.format('MMM D'), ...bucketTotals(reps) }
    })
  }, [myReports, range])

  if (reportsLoading) return <LoadingSpinner />

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Button
          type="primary"
          icon={<FileAddOutlined />}
          style={{ background: INDIGO, borderColor: INDIGO, borderRadius: 8, fontWeight: 500 }}
          onClick={() => nav('/submit-report')}
        >
          Submit today
        </Button>
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <KpiCard
          label="Monthly tasks"
          value={kpi.monthTasks}
          unit="tasks"
          footerIcon={<ClockCircleOutlined style={{ fontSize: 13 }} />}
          footerText={`${kpi.todayTasks} logged today`}
        />
        <KpiCard
          label="Monthly hours"
          value={kpi.monthHours}
          unit="hrs"
          footerIcon={<ClockCircleOutlined style={{ fontSize: 13 }} />}
          footerText={`${kpi.todayHours} hrs today`}
        />
        <KpiCard
          label="Report streak"
          value={kpi.streak || '—'}
          unit={kpi.streak ? 'days' : ''}
          footerIcon={<FireOutlined style={{ fontSize: 13 }} />}
          footerText={kpi.streak ? 'Keep it going' : 'No streak yet'}
          accent={kpi.streak ? AMBER : MUTED}
        />
      </div>

      {/* ── Weekly summary + Team today ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: canSeeTeam ? '1fr 220px' : '1fr',
        gap: 12, alignItems: 'stretch',
      }}>

        {/* Weekly summary chart */}
        <div style={{
          background: '#fff', borderRadius: 12, border: `0.5px solid ${BORDER}`,
          padding: '18px 20px 14px', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
            <div>
              <Text style={{ fontSize: 13, fontWeight: 500, color: INK, display: 'block', marginBottom: 2 }}>
                Activity summary
              </Text>
              <Text style={{ fontSize: 11.5, color: MUTED }}>{RANGE_CAPTIONS[range]}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: '#595959' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: INDIGO, display: 'inline-block' }} />Tasks
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: AMBER, display: 'inline-block' }} />Hours
                </span>
              </div>
              <Segmented
                size="small"
                options={RANGE_OPTIONS}
                value={range}
                onChange={setRange}
              />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
              <ReTooltip content={<LineTooltip />} cursor={{ stroke: BORDER, strokeWidth: 2 }} />
              <Line
                yAxisId="left" type="monotone" dataKey="tasks" name="Tasks"
                stroke={INDIGO} strokeWidth={2}
                dot={{ r: 4, fill: INDIGO, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: INDIGO }}
              />
              <Line
                yAxisId="right" type="monotone" dataKey="hours" name="Hours"
                stroke={AMBER} strokeWidth={2} strokeDasharray="5 4"
                dot={{ r: 4, fill: AMBER, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: AMBER }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Team today */}
        {canSeeTeam && (
          <div style={{
            background: '#fff', borderRadius: 12, border: `0.5px solid ${BORDER}`,
            padding: 18, display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: 500, color: INK }}>Team today</Text>
              <span style={{
                fontSize: 11, color: MUTED, background: '#fafafa',
                padding: '2px 8px', borderRadius: 20, border: `0.5px solid ${BORDER}`,
              }}>
                {statusTotal} members
              </span>
            </div>

            {statusLoading ? <LoadingSpinner /> : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {statusData.map(d => (
                    <div key={d.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: '#595959', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                          {d.name}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: INK }}>{d.value}</span>
                      </div>
                      <div style={{ height: 3, background: '#eef0f3', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 2, background: d.color,
                          width: statusTotal > 0 ? `${(d.value / statusTotal) * 100}%` : '0%',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: `0.5px solid ${BORDER}`, paddingTop: 14 }}>
                  <Text style={{
                    fontSize: 10.5, color: MUTED, textTransform: 'uppercase',
                    letterSpacing: '0.06em', display: 'block', marginBottom: 10,
                  }}>
                    Members
                  </Text>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    {status?.map(s => {
                      const color = s.status === 'SUBMITTED' ? GREEN : s.status === 'LATE' ? AMBER : s.status === 'MISSING' ? RED : '#c0c0c0'
                      return (
                        <div
                          key={s.user.id}
                          title={`${s.user.name} — ${s.status.toLowerCase()}`}
                          style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: `${color}1f`, border: `2px solid ${color}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10.5, fontWeight: 500, color,
                          }}
                        >
                          {initials(s.user.name)}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Pending report banner ── */}
      {!todayRep && (
        <div style={{
          background: '#fffaf0', border: '0.5px solid #fde3ae',
          borderRadius: 12, padding: '14px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ExclamationCircleOutlined style={{ fontSize: 17, color: '#b26a00' }} />
            <div>
              <Text style={{ fontSize: 12.5, fontWeight: 500, color: '#b26a00', display: 'block', marginBottom: 1 }}>
                Today's report is pending
              </Text>
              <Text style={{ fontSize: 11.5, color: '#b26a00', opacity: 0.8 }}>
                Log your work before end of day to keep the team in sync.
              </Text>
            </div>
          </div>
          <Button
            style={{ background: '#b26a00', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, flexShrink: 0 }}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            onClick={() => nav('/submit-report')}
          >
            Submit now
          </Button>
        </div>
      )}

    </div>
  )
}
