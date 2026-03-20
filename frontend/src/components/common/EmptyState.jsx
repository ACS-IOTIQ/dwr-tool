
// ── frontend/src/components/common/EmptyState.jsx ────────────────
import { Empty } from 'antd'

export default function EmptyState({ description = 'No data' }) {
  return <Empty description={description} style={{ padding: 48 }} />
}