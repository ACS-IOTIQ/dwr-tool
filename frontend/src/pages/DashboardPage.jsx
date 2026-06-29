// ── frontend/src/pages/DashboardPage.jsx ────────────────────────
import { useMemo } from 'react'
import { Row, Col, Card, Typography, Space } from 'antd'
import { FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons'
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import dayjs from 'dayjs'
import { useAuthStore } from '../store/authStore'
import { isAdmin, isRM } from '../utils/roleUtils'
import { useVisibleUsers } from '../hooks/useUsers'
import { useDailyStatus, useMyReports } from '../hooks/useReports'
import { today } from '../utils/dateUtils'
import LoadingSpinner from '../components/common/LoadingSpinner'

const { Title, Text } = Typography

const GREEN  = '#52c41a'
const ORANGE = '#fa8c16'
const RED    = '#e24b4a'

// ── KPI Card ─────────────────────────────────────────────────────
function KpiCard({ icon, label, value, unit, todayValue, todayUnit, color }) {
  return (
    <Card
      style={{
        height: '100%',
        borderRadius: 12,
        borderTop: `3px solid ${color}`,
        border: '0.5px solid #f0f0f0',
      }}
      styles={{ body: { padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' } }}
    >
      {/* Top row: icon + label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: `${color}1a`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <Text style={{ fontSize: 12, color: '#a0a0a0', fontWeight: 500, letterSpacing: '0.04em' }}>
          {label}
        </Text>
      </div>

      {/* Value */}
      <div style={{ marginBottom: 16, lineHeight: 1 }}>
        <span style={{ fontSize: 42, fontWeight: 500, color: '#1a1a1a' }}>{value}</span>
        <span style={{ fontSize: 14, color: '#a0a0a0', marginLeft: 5 }}>{unit}</span>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '0.5px solid #f0f0f0',
        paddingTop: 11,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Text style={{ fontSize: 12, color: '#a0a0a0' }}>Today</Text>
        <Text style={{ fontSize: 13, fontWeight: 500, color: '#a0a0a0' }}>
          {todayValue} {todayUnit}
        </Text>
      </div>
    </Card>
  )
}

// ── Line chart tooltip ────────────────────────────────────────────
const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid #f0f0f0',
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

// ── Donut tooltip ─────────────────────────────────────────────────
const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{
      background: '#fff', border: `1px solid ${d.payload.color}40`,
      padding: '8px 12px', borderRadius: 8, fontSize: 13,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <span style={{ color: d.payload.color, fontWeight: 600 }}>{d.name}</span>: {d.value}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user }           = useAuthStore()
  const { data: allUsers } = useVisibleUsers()
  const canSeeTeam         = isAdmin(user) || isRM(user, allUsers)
  const { data: status,    isLoading: statusLoading  } = useDailyStatus(today(), canSeeTeam)
  const { data: myReports, isLoading: reportsLoading } = useMyReports()

  const todayStr = today()

  // ── KPI ──────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    if (!myReports) return { monthTasks: 0, todayTasks: 0, monthHours: 0, todayHours: 0 }

    const thisMonth = dayjs().format('YYYY-MM')
    const monthReps = myReports.filter(r => r.report_date?.startsWith(thisMonth))
    const todayRep  = myReports.find(r => r.report_date === todayStr)

    const tasks = (reps) => reps.reduce((s, r) => s + (r.tasks?.length || 0), 0)
    const hours = (reps) => parseFloat(
      reps.reduce((s, r) =>
        s + (r.tasks?.reduce((h, t) => h + (Number(t.time_spent_hours) || 0), 0) || 0), 0
      ).toFixed(1)
    )

    return {
      monthTasks:  tasks(monthReps),
      todayTasks:  todayRep ? tasks([todayRep]) : 0,
      monthHours:  hours(monthReps),
      todayHours:  todayRep ? hours([todayRep]) : 0,
    }
  }, [myReports, todayStr])

  // ── Donut ─────────────────────────────────────────────────────────
  const donutData = useMemo(() => {
    if (!status) return []
    return [
      { name: 'Submitted', value: status.filter(s => s.status === 'SUBMITTED').length, color: GREEN  },
      { name: 'Late',      value: status.filter(s => s.status === 'LATE'     ).length, color: ORANGE },
      { name: 'Missing',   value: status.filter(s => s.status === 'MISSING'  ).length, color: RED    },
    ]
  }, [status])

  const donutTotal = donutData.reduce((s, d) => s + d.value, 0)

  // ── Weekly trend (last 8 weeks) ───────────────────────────────────
  const weeklyData = useMemo(() => (
    Array.from({ length: 8 }, (_, i) => {
      const start = dayjs().subtract(7 - i, 'week').startOf('week')
      const end   = start.endOf('week')
      const reps  = myReports?.filter(r => {
        const d = dayjs(r.report_date)
        return !d.isBefore(start) && !d.isAfter(end)
      }) || []
      const tasks = reps.reduce((s, r) => s + (r.tasks?.length || 0), 0)
      const hours = parseFloat(
        reps.reduce((s, r) =>
          s + (r.tasks?.reduce((h, t) => h + (Number(t.time_spent_hours) || 0), 0) || 0), 0
        ).toFixed(1)
      )
      return { week: start.format('MMM D'), tasks, hours }
    })
  ), [myReports])

  if (reportsLoading) return <LoadingSpinner />

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 500 }}>
          Welcome back, {user?.name}
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          {dayjs().format('dddd, MMMM D, YYYY')}
        </Text>
      </div>

      {/* ── Top row: KPI cards + Team Overview donut ── */}
      <Row gutter={14} style={{ marginBottom: 14 }} align="stretch">

        {/* KPI: Monthly Tasks */}
        <Col span={canSeeTeam ? 7 : 12}>
          <KpiCard
            icon={<FileTextOutlined style={{ color: GREEN, fontSize: 17 }} />}
            label="Monthly tasks"
            value={kpi.monthTasks}
            unit="tasks"
            todayValue={kpi.todayTasks}
            todayUnit="tasks"
            color={GREEN}
          />
        </Col>

        {/* KPI: Monthly Hours */}
        <Col span={canSeeTeam ? 7 : 12}>
          <KpiCard
            icon={<ClockCircleOutlined style={{ color: ORANGE, fontSize: 17 }} />}
            label="Monthly hours"
            value={kpi.monthHours}
            unit="hrs"
            todayValue={kpi.todayHours}
            todayUnit="hrs"
            color={ORANGE}
          />
        </Col>

        {/* Team Overview Donut (admin/RM only) */}
        {canSeeTeam && (
          <Col span={10}>
            <Card
              style={{ borderRadius: 12, height: '100%', border: '0.5px solid #f0f0f0' }}
              styles={{ body: { padding: '20px 22px', height: '100%' } }}
            >
              <Text style={{
                fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: '#a0a0a0', display: 'block', marginBottom: 16,
              }}>
                Team overview — today
              </Text>

              {statusLoading ? <LoadingSpinner /> : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

                  {/* Donut */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <ResponsiveContainer width={120} height={120}>
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%" cy="50%"
                          innerRadius={38} outerRadius={56}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <ReTooltip content={<DonutTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center', pointerEvents: 'none',
                    }}>
                      <div style={{ fontSize: 22, fontWeight: 500, color: '#1a1a1a', lineHeight: 1 }}>
                        {donutTotal}
                      </div>
                      <div style={{ fontSize: 10, color: '#a0a0a0', marginTop: 2 }}>members</div>
                    </div>
                  </div>

                  {/* Status breakdown beside the donut */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {donutData.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Dot */}
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                        {/* Label + bar */}
                        <div style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, color: '#595959', display: 'block' }}>{d.name}</Text>
                          <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, marginTop: 4 }}>
                            <div style={{
                              height: 4, borderRadius: 2, background: d.color,
                              width: donutTotal > 0 ? `${(d.value / donutTotal) * 100}%` : '0%',
                            }} />
                          </div>
                        </div>
                        {/* Count */}
                        <Text style={{
                          fontSize: 14, fontWeight: 500, minWidth: 18, textAlign: 'right',
                          color: d.name === 'Missing' && d.value > 0 ? RED : '#1a1a1a',
                        }}>
                          {d.value}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </Col>
        )}
      </Row>

      {/* ── Weekly trend chart ── */}
      <Row>
        <Col span={24}>
          <Card
            style={{ borderRadius: 12, border: '0.5px solid #f0f0f0' }}
            styles={{ body: { padding: '20px 20px 14px' } }}
          >
            <Text style={{
              fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: '#a0a0a0', display: 'block', marginBottom: 16,
            }}>
              Weekly summary — tasks &amp; hours
            </Text>

            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: '#a0a0a0' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#a0a0a0' }}
                  axisLine={false} tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#a0a0a0' }}
                  axisLine={false} tickLine={false}
                />
                <ReTooltip content={<LineTooltip />} cursor={{ stroke: '#f0f0f0', strokeWidth: 2 }} />
                <Line
                  yAxisId="left" type="monotone" dataKey="tasks" name="Tasks"
                  stroke={GREEN} strokeWidth={2}
                  dot={{ r: 4, fill: GREEN, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: GREEN }}
                />
                <Line
                  yAxisId="right" type="monotone" dataKey="hours" name="Hours"
                  stroke={ORANGE} strokeWidth={2} strokeDasharray="5 4"
                  dot={{ r: 4, fill: ORANGE, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: ORANGE }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 10 }}>
              {[{ color: GREEN, label: 'Tasks', dashed: false }, { color: ORANGE, label: 'Hours', dashed: true }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 22, height: 0,
                    borderTop: `2.5px ${l.dashed ? 'dashed' : 'solid'} ${l.color}`,
                  }} />
                  <Text style={{ fontSize: 12, color: '#595959' }}>{l.label}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

    </div>
  )
}