
// ── frontend/src/pages/ReportExplorerPage.jsx ───────────────────
import { Typography, Table, Button, Space, Tag } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReportFilterBar from '../components/reports/ReportFilterBar'
import { ReviewStatusBadge, SubmissionStatusBadge } from '../components/common/StatusBadge'
import { useUsers } from '../hooks/useUsers'
import { useQuery } from '@tanstack/react-query'
import { getWorkTypes } from '../api/workTypesApi'
import { searchReports } from '../api/reportsApi'
import { fmt } from '../utils/dateUtils'

const { Title } = Typography

export default function ReportExplorerPage() {
  const nav = useNavigate()
  const [filters, setFilters] = useState(null)
  const { data: users } = useUsers()
  const { data: workTypes } = useQuery({ queryKey: ['work-types'], queryFn: () => getWorkTypes().then(r => r.data) })
  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ['report-explorer', filters],
    queryFn: () => searchReports(filters || {}).then(r => r.data),
    enabled: !!filters,
  })

  const cols = [
    { title: 'Member', dataIndex: ['user', 'name'], key: 'name' },
    { title: 'Date', dataIndex: 'report_date', render: fmt },
    { title: 'Tasks', dataIndex: 'tasks', render: t => t?.length },
    { title: 'Work Types', dataIndex: 'tasks', render: tasks => (
      <Space wrap>{[...new Set(tasks?.map(t => t.work_type?.label))].map(l => <Tag key={l}>{l}</Tag>)}</Space>
    )},
    { title: 'Late?', dataIndex: 'is_late', render: v => v ? <Tag color="orange">Late</Tag> : null },
    { title: 'Blockers', dataIndex: 'blockers', render: v => v ? <Tag color="red">Yes</Tag> : null },
    { title: 'Review', dataIndex: 'review_status', render: s => <ReviewStatusBadge status={s} /> },
    { key: 'action', render: (_, r) => <Button size="small" onClick={() => nav(`/reports/${r.id}`)}>View</Button> },
  ]

  return (
    <>
      <Title level={4}>Report Explorer</Title>
      <ReportFilterBar users={users} workTypes={workTypes} onSearch={f => setFilters(f)} loading={isLoading} />
      {filters && <Table dataSource={reports} columns={cols} rowKey="id" loading={isLoading} />}
    </>
  )
}
