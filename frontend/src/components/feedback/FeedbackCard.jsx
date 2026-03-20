
// ── frontend/src/components/feedback/FeedbackCard.jsx ────────────
import { Card, Tag, Typography, Space } from 'antd'
import { FlagOutlined } from '@ant-design/icons'
import { fmtDateTime } from '../../utils/dateUtils'

const { Text, Paragraph } = Typography

export default function FeedbackCard({ fb }) {
  return (
    <Card size="small" style={{ marginBottom: 8, borderLeft: fb.is_flagged ? '3px solid red' : undefined }}>
      <Space style={{ marginBottom: 4 }}>
        <Text strong>{fb.reviewer?.name}</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>{fmtDateTime(fb.created_at)}</Text>
        {fb.is_flagged && <Tag icon={<FlagOutlined />} color="red">Flagged</Tag>}
      </Space>
      <Paragraph style={{ marginBottom: 0 }}>{fb.comment}</Paragraph>
    </Card>
  )
}

