import { Table, Tag, Button, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useMyReports } from '../hooks/useReports'
import { ReviewStatusBadge } from '../components/common/StatusBadge'
import { fmt, fmtDateTime } from '../utils/dateUtils'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

const { Title } = Typography

export default function MyReportsPage() {
  const { data: reports, isLoading, error } = useMyReports()
  const nav = useNavigate()

  if (isLoading) return <LoadingSpinner />
  if (error) return <EmptyState description={`Error loading reports: ${error.message}`} />
  if (!reports?.length) return (
    <>
      <Title level={4}>My Reports</Title>
      <EmptyState description="No reports submitted yet" />
    </>
  )

  const cols = [
    {
      title: 'Date',
      dataIndex: 'report_date',
      render: fmt,
      sorter: (a, b) => a.report_date.localeCompare(b.report_date),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Submitted At',
      dataIndex: 'submitted_at',
      render: fmtDateTime,
    },
    {
      title: 'On Time?',
      dataIndex: 'is_late',
      render: v => v
        ? <Tag color="orange">Late</Tag>
        : <Tag color="green">On Time</Tag>,
    },
    {
      title: 'Tasks',
      dataIndex: 'tasks',
      render: t => t?.length ?? 0,
    },
    {
      title: 'Review Status',
      dataIndex: 'review_status',
      render: s => <ReviewStatusBadge status={s} />,
    },
    {
      title: '',
      key: 'action',
      render: (_, r) => (
        <Button size="small" onClick={() => nav(`/reports/${r.id}`)}>
          View & Feedback
        </Button>
      ),
    },
  ]

  return (
    <>
      <Title level={4}>My Reports</Title>
      <Table
        dataSource={reports}
        columns={cols}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </>
  )
}