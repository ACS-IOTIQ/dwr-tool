
// ── frontend/src/pages/ReportDetailPage.jsx ─────────────────────
import { useParams, useLocation } from 'react-router-dom'
import { Row, Col, Select, Card, Space, Typography, Divider } from 'antd'
import { useReport, useUpdateReportStatus } from '../hooks/useReports'
import ReportCard from '../components/reports/ReportCard'
import FeedbackPanel from '../components/feedback/FeedbackPanel'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuthStore } from '../store/authStore'
import { isAdmin, isRM } from '../utils/roleUtils'
import { useVisibleUsers } from '../hooks/useUsers'

export default function ReportDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const filters = location.state?.filters
  const { data: report, isLoading } = useReport(id)
  const updateStatus = useUpdateReportStatus()
  const { user } = useAuthStore()
  const { data: allUsers } = useVisibleUsers()
  const canReview = isAdmin(user) || isRM(user, allUsers)

  if (isLoading) return <LoadingSpinner />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
      <ReportCard report={report} />

      {canReview && (
        <Card size="small" style={{ borderRadius: 8 }}>
          <Space align="center">
            <Typography.Text strong>Review Status:</Typography.Text>
            <Select
              value={report?.review_status}
              style={{ width: 180 }}
              onChange={status => updateStatus.mutate({ id: Number(id), status })}
            >
              {['PENDING', 'REVIEWED', 'FLAGGED'].map(s => (
                <Select.Option key={s} value={s}>{s}</Select.Option>
              ))}
            </Select>
          </Space>
        </Card>
      )}

      <Card title="Feedback" styles={{ body: { padding: '16px 24px' } }}>
        <FeedbackPanel reportId={Number(id)} filters={filters} />
      </Card>
    </div>
  )
}

