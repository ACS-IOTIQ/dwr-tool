
// ── frontend/src/components/reports/ReportCard.jsx ───────────────
import { Card, Tag, Descriptions, Table, Typography, Space } from 'antd'
import { ReviewStatusBadge } from '../common/StatusBadge'
import { fmtDateTime, fmt } from '../../utils/dateUtils'

const { Text } = Typography

export default function ReportCard({ report }) {
  if (!report) return null
  const cols = [
    { title: 'Task', dataIndex: 'task_description', key: 'desc', width: '40%' },
    { title: 'Type', dataIndex: ['work_type', 'label'], key: 'wt' },
    { title: 'Status', dataIndex: 'status', key: 'st', render: s => <Tag>{s}</Tag> },
    { title: 'Hours', dataIndex: 'time_spent_hours', key: 'h', render: v => v ?? '—' },
    { title: 'Notes', dataIndex: 'notes', key: 'n', render: v => v ?? '—' },
  ]
  return (
    <Card
      title={`Report — ${fmt(report.report_date)}`}
      extra={<Space><ReviewStatusBadge status={report.review_status} />{report.is_late && <Tag color="orange">Late</Tag>}</Space>}
    >
      <Descriptions size="small" column={2} style={{ marginBottom: 12 }}>
        <Descriptions.Item label="Submitted by">{report.user?.name}</Descriptions.Item>
        <Descriptions.Item label="Submitted at">{fmtDateTime(report.submitted_at)}</Descriptions.Item>
        <Descriptions.Item label="Mood / Energy">{report.mood_rating ? '⭐'.repeat(report.mood_rating) : '—'}</Descriptions.Item>
      </Descriptions>
      <Table dataSource={report.tasks} columns={cols} rowKey="id" size="small" pagination={false} />
      {report.plan_for_tomorrow && (
        <Descriptions style={{ marginTop: 12 }} size="small">
          <Descriptions.Item label="Plan for Tomorrow">{report.plan_for_tomorrow}</Descriptions.Item>
          {report.blockers && <Descriptions.Item label="Blockers">{report.blockers}</Descriptions.Item>}
        </Descriptions>
      )}
    </Card>
  )
}

