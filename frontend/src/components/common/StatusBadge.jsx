
// ── frontend/src/components/common/StatusBadge.jsx ──────────────
import { Tag } from 'antd'
import { STATUS_COLORS, REVIEW_STATUS_COLORS } from '../../utils/roleUtils'

export function SubmissionStatusBadge({ status }) {
  return <Tag color={STATUS_COLORS[status] || 'default'}>{status}</Tag>
}

export function ReviewStatusBadge({ status }) {
  return <Tag color={REVIEW_STATUS_COLORS[status] || 'default'}>{status}</Tag>
}
