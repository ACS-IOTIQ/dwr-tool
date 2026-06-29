
// ── frontend/src/components/reports/ReportCard.jsx ───────────────
import { Card, Tag, Descriptions, Table, Typography, Space } from 'antd'
import { ReviewStatusBadge } from '../common/StatusBadge'
import { fmtDateTime, fmt } from '../../utils/dateUtils'

const { Text } = Typography

export default function ReportCard({ report }) {
  if (!report) return null

  const cols = [
    { title: 'Task', dataIndex: 'task_description', key: 'desc' },
    { title: 'Type', dataIndex: ['work_type', 'label'], key: 'wt', width: 120 },
    { title: 'Status', dataIndex: 'status', key: 'st', width: 100, render: s => <Tag>{s}</Tag> },
    { title: 'Hours', dataIndex: 'time_spent_hours', key: 'h', width: 70, render: v => v ?? '—' },
  ]

  const expandedRowRender = (task) =>
    task.notes ? (
      <Text type="secondary" style={{ paddingLeft: 8 }}>{task.notes}</Text>
    ) : (
      <Text type="secondary" style={{ paddingLeft: 8, fontStyle: 'italic' }}>No notes</Text>
    )

  return (
    <Card
      title={`Report — ${fmt(report.report_date)}`}
      extra={
        <Space>
          <ReviewStatusBadge status={report.review_status} />
          {report.is_late && <Tag color="orange">Late</Tag>}
        </Space>
      }
      styles={{ body: { padding: '20px 24px' } }}
    >
      <Descriptions size="small" column={3} style={{ marginBottom: 20 }}>
        <Descriptions.Item label="Submitted by">
          <Text strong>{report.user?.name}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Submitted at">{fmtDateTime(report.submitted_at)}</Descriptions.Item>
        <Descriptions.Item label="Mood / Energy">
          {report.mood_rating ? '⭐'.repeat(report.mood_rating) : '—'}
        </Descriptions.Item>
      </Descriptions>

      <Table
        dataSource={report.tasks}
        columns={cols}
        rowKey="id"
        size="small"
        pagination={false}
        expandable={{
          expandedRowRender,
          rowExpandable: () => true,
          expandRowByClick: false,
        }}
      />

      {(report.plan_for_tomorrow || report.blockers) && (
        <Descriptions style={{ marginTop: 20 }} size="small" column={1} bordered>
          {report.plan_for_tomorrow && (
            <Descriptions.Item label="Plan for Tomorrow">{report.plan_for_tomorrow}</Descriptions.Item>
          )}
          {report.blockers && (
            <Descriptions.Item label="Blockers">
              <Text type="warning">{report.blockers}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      )}
    </Card>
  )
}

