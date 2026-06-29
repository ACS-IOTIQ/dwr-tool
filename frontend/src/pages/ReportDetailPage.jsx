
// ── frontend/src/pages/ReportDetailPage.jsx ─────────────────────
import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Select, Card, Space, Typography, Button, Drawer, Form, Input, Checkbox } from 'antd'
import { MessageOutlined } from '@ant-design/icons'
import { useReport, useUpdateReportStatus } from '../hooks/useReports'
import { usePostFeedback } from '../hooks/useFeedback'
import ReportCard from '../components/reports/ReportCard'
import FeedbackPanel from '../components/feedback/FeedbackPanel'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuthStore } from '../store/authStore'
import { isAdmin, isRM } from '../utils/roleUtils'
import { useVisibleUsers } from '../hooks/useUsers'

export default function ReportDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const filters = location.state?.filters
  const { data: report, isLoading } = useReport(id)
  const updateStatus = useUpdateReportStatus()
  const postFeedback = usePostFeedback(Number(id))
  const { user } = useAuthStore()
  const { data: allUsers } = useVisibleUsers()
  const canReview = isAdmin(user) || isRM(user, allUsers)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form] = Form.useForm()

  const handlePost = (vals) => {
    postFeedback.mutate(vals, {
      onSuccess: () => {
        form.resetFields()
        setDrawerOpen(false)
        navigate('/report-explorer', { state: { filters } })
      }
    })
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
      <ReportCard report={report} />

      {canReview && (
        <Card size="small">
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

      <Card
        title="Feedback"
        extra={
          canReview && (
            <Button
              type="primary"
              icon={<MessageOutlined />}
              onClick={() => setDrawerOpen(true)}
            >
              Post Feedback
            </Button>
          )
        }
        styles={{ body: { padding: '16px 24px' } }}
      >
        <FeedbackPanel reportId={Number(id)} />
      </Card>

      <Drawer
        title="Post Feedback"
        placement="right"
        width={420}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields() }}
      >
        <Form form={form} onFinish={handlePost} layout="vertical">
          <Form.Item
            name="comment"
            label="Your Feedback"
            rules={[{ required: true, message: 'Please enter your feedback' }]}
          >
            <Input.TextArea rows={6} placeholder="Write your feedback here..." />
          </Form.Item>
          <Form.Item name="is_flagged" valuePropName="checked">
            <Checkbox>Flag this report for follow-up</Checkbox>
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={postFeedback.isPending}
            block
            size="large"
          >
            Submit Feedback
          </Button>
        </Form>
      </Drawer>
    </div>
  )
}

