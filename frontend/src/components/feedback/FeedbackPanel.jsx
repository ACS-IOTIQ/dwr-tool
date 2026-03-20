
// ── frontend/src/components/feedback/FeedbackPanel.jsx ───────────
import { Form, Input, Checkbox, Button, Divider, Typography } from 'antd'
import FeedbackCard from './FeedbackCard'
import { useFeedback, usePostFeedback } from '../../hooks/useFeedback'
import { useAuthStore } from '../../store/authStore'
import { isAdmin, isRM } from '../../utils/roleUtils'
import { useUsers } from '../../hooks/useUsers'
import EmptyState from '../common/EmptyState'

const { Title } = Typography

export default function FeedbackPanel({ reportId }) {
  const [form] = Form.useForm()
  const { data: feedbacks, isLoading } = useFeedback(reportId)
  const postFeedback = usePostFeedback(reportId)
  const { user } = useAuthStore()
  const { data: allUsers } = useUsers()
  const canPost = isAdmin(user) || isRM(user, allUsers)

  const handlePost = (vals) => {
    postFeedback.mutate(vals, { onSuccess: () => form.resetFields() })
  }

  return (
    <div>
      <Title level={5}>Feedback</Title>
      {isLoading ? null : feedbacks?.length ? feedbacks.map(fb => <FeedbackCard key={fb.id} fb={fb} />) : <EmptyState description="No feedback yet" />}
      {canPost && (
        <>
          <Divider />
          <Form form={form} onFinish={handlePost} layout="vertical">
            <Form.Item name="comment" rules={[{ required: true, message: 'Enter feedback' }]}>
              <Input.TextArea rows={3} placeholder="Your feedback..." />
            </Form.Item>
            <Form.Item name="is_flagged" valuePropName="checked">
              <Checkbox>Flag this report for follow-up</Checkbox>
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={postFeedback.isPending}>Post Feedback</Button>
          </Form>
        </>
      )}
    </div>
  )
}

