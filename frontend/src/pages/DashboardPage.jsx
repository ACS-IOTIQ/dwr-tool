
// ── frontend/src/pages/DashboardPage.jsx ────────────────────────
import { Typography, Row, Col, Card, Statistic } from 'antd'
import { useAuthStore } from '../store/authStore'
import { isAdmin, isRM } from '../utils/roleUtils'
import { useVisibleUsers } from '../hooks/useUsers'
import { useDailyStatus } from '../hooks/useReports'
import { today } from '../utils/dateUtils'
import LoadingSpinner from '../components/common/LoadingSpinner'

const { Title, Text } = Typography

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: allUsers } = useVisibleUsers()
  const canSeeTeam = isAdmin(user) || isRM(user, allUsers)
  const { data: status, isLoading } = useDailyStatus(today())

  const counts = status ? {
    submitted: status.filter(s => s.status === 'SUBMITTED').length,
    late: status.filter(s => s.status === 'LATE').length,
    missing: status.filter(s => s.status === 'MISSING').length,
  } : {}

  return (
    <div>
      <Title level={3}>Welcome, {user?.name} 👋</Title>
      <Text type="secondary">Today: {new Date().toDateString()}</Text>
      {canSeeTeam && (
        <Row gutter={16} style={{ marginTop: 24 }}>
          {isLoading ? <LoadingSpinner /> : <>
            <Col span={8}><Card><Statistic title="Submitted" value={counts.submitted ?? 0} valueStyle={{ color: '#3f8600' }} /></Card></Col>
            <Col span={8}><Card><Statistic title="Late" value={counts.late ?? 0} valueStyle={{ color: '#d48806' }} /></Card></Col>
            <Col span={8}><Card><Statistic title="Missing" value={counts.missing ?? 0} valueStyle={{ color: '#cf1322' }} /></Card></Col>
          </>}
        </Row>
      )}
    </div>
  )
}
