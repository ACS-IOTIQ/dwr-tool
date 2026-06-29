
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
const RED    = '#f5222d'

// ── KPI Card ─────────────────────────────────────────────────────
function KpiCard({ icon, label, value, unit, todayValue, todayUnit, color }) {
  return (
    <Card
      style={{ height: '100%', borderTop: `3px solid ${color}`, borderRadius: 10 }}
      styles={{ body: { padding: '22px 24px' } }}
    >
      <Space style={{ marginBottom: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9,
          background: `${color}1a`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>{label}</Text>
      </Space>

      <div style={{ lineHeight: 1 }}>
        <span style={{ fontSize: 40, fontWeight: 700, color: '#1a1a1a' }}>{value}</span>
        <span style={{ fontSize: 14, color: '#a0a0a0', marginLeft: 6 }}>{unit}</span>
      </div>

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Today:{' '}
          <span style={{ color, fontWeight: 600, fontSize: 13 }}>
            {todayValue} {todayUnit}
          </span>
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
  const { user }              = useAuthStore()
  const { data: allUsers }    = useVisibleUsers()
  const canSeeTeam            = isAdmin(user) || isRM(user, allUsers)
  const { data: status, isLoading: statusLoading } = useDailyStatus(today())
  const { data: myReports,   isLoading: reportsLoading } = useMyReports()

  const todayStr = today()

  // ── KPI ──────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    if (!myReports) return { monthTasks: 0, todayTasks: 0, monthHours: 0, todayHours: 0 }

    const thisMonth   = dayjs().format('YYYY-MM')
    const monthReps   = myReports.filter(r => r.report_date?.startsWith(thisMonth))
    const todayRep    = myReports.find(r => r.report_date === todayStr)

    const tasks  = (reps) => reps.reduce((s, r) => s + (r.tasks?.length || 0), 0)
    const hours  = (reps) => parseFloat(
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
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          Welcome back, {user?.name}
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          {dayjs().format('dddd, MMMM D, YYYY')}
        </Text>
      </div>

      {/* KPI row */}
      <Row gutter={20} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <KpiCard
            icon={<FileTextOutlined style={{ color: GREEN, fontSize: 18 }} />}
            label="Monthly Tasks"
            value={kpi.monthTasks}
            unit="tasks"
            todayValue={kpi.todayTasks}
            todayUnit="tasks"
            color={GREEN}
          />
        </Col>
        <Col span={12}>
          <KpiCard
            icon={<ClockCircleOutlined style={{ color: ORANGE, fontSize: 18 }} />}
            label="Monthly Hours"
            value={kpi.monthHours}
            unit="hrs"
            todayValue={kpi.todayHours}
            todayUnit="hrs"
            color={ORANGE}
          />
        </Col>
      </Row>

      {/* Charts row */}
      <Row gutter={20}>

        {/* Donut — team overview */}
        {canSeeTeam && (
          <Col span={9}>
            <Card
              title="Team Overview — Today"
              style={{ borderRadius: 10, height: '100%' }}
              styles={{ body: { padding: '16px 20px 20px' } }}
            >
              {statusLoading ? <LoadingSpinner /> : (
                <>
                  {/* Donut with overlaid center label */}
                  <div style={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height={210}>
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%" cy="50%"
                          innerRadius={62} outerRadius={85}
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
                      <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>
                        {donutTotal}
                      </div>
                      <div style={{ fontSize: 11, color: '#a0a0a0', marginTop: 3 }}>members</div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                    {donutData.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 9, height: 9, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                        <Text style={{ fontSize: 12 }}>{d.name} <strong>{d.value}</strong></Text>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </Col>
        )}

        {/* Line chart — weekly trend */}
        <Col span={canSeeTeam ? 15 : 24}>
          <Card
            title="Weekly Summary — Tasks & Hours"
            style={{ borderRadius: 10 }}
            styles={{ body: { padding: '12px 16px 16px' } }}
          >
            <ResponsiveContainer width="100%" height={250}>
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
                  yAxisId="left"
                  type="monotone"
                  dataKey="tasks"
                  name="Tasks"
                  stroke={GREEN}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: GREEN, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: GREEN }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="hours"
                  name="Hours"
                  stroke={ORANGE}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: ORANGE, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: ORANGE }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 6 }}>
              {[{ color: GREEN, label: 'Tasks' }, { color: ORANGE, label: 'Hours' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 22, height: 3, background: l.color, borderRadius: 2 }} />
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
