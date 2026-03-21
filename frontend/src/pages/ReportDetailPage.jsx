
// ── frontend/src/pages/ReportDetailPage.jsx ─────────────────────
import { useParams, useLocation } from 'react-router-dom'
import { Row, Col, Select, Space, Typography } from 'antd'
import { useReport, useUpdateReportStatus } from '../hooks/useReports'
import ReportCard from '../components/reports/ReportCard'
import FeedbackPanel from '../components/feedback/FeedbackPanel'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuthStore } from '../store/authStore'
import { isAdmin, isRM } from '../utils/roleUtils'
import { useUsers } from '../hooks/useUsers'

export default function ReportDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const filters = location.state?.filters
  const { data: report, isLoading } = useReport(id)
  const updateStatus = useUpdateReportStatus()
  const { user } = useAuthStore()
  const { data: allUsers } = useUsers()
  const canReview = isAdmin(user) || isRM(user, allUsers)

  if (isLoading) return <LoadingSpinner />

  return (
    <Row gutter={24}>
      <Col span={16}>
        <ReportCard report={report} />
        {canReview && (
          <Space style={{ marginTop: 12 }}>
            <Typography.Text>Review Status:</Typography.Text>
            <Select
              value={report?.review_status}
              style={{ width: 160 }}
              onChange={status => updateStatus.mutate({ id: Number(id), status })}
            >
              {['PENDING','REVIEWED','FLAGGED'].map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
            </Select>
          </Space>
        )}
      </Col>
      <Col span={8}>
        <FeedbackPanel reportId={Number(id)} filters={filters} />
      </Col>
    </Row>
  )
}

