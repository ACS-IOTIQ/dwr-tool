
// ── frontend/src/components/reports/ReportStatusGrid.jsx ─────────
import { Table, Tag, Button, Typography } from 'antd'
import { SubmissionStatusBadge } from '../common/StatusBadge'
import { useNavigate } from 'react-router-dom'
import { fmtDateTime } from '../../utils/dateUtils'

export default function ReportStatusGrid({ data, loading }) {
  const nav = useNavigate()
  const cols = [
    { title: 'Name', dataIndex: ['user', 'name'], key: 'name', sorter: (a, b) => a.user.name.localeCompare(b.user.name) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <SubmissionStatusBadge status={s} />,
      filters: ['SUBMITTED','LATE','MISSING','ON_LEAVE'].map(s => ({ text: s, value: s })),
      onFilter: (v, r) => r.status === v,
    },
    { title: 'Submitted At', dataIndex: 'submitted_at', key: 'at', render: fmtDateTime },
    { title: '', key: 'action', render: (_, r) => r.report_id ? (
      <Button size="small" onClick={() => nav(`/reports/${r.report_id}`)}>View</Button>
    ) : null },
  ]
  return (
    <Table
      dataSource={data}
      columns={cols}
      rowKey={r => r.user.id}
      loading={loading}
      size="small"
      pagination={false}
    />
  )
}
