
// ── frontend/src/pages/ReportExplorerPage.jsx ───────────────────
import { Typography, Table, Button, Space, Tag } from 'antd'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ReportFilterBar from '../components/reports/ReportFilterBar'
import { ReviewStatusBadge, SubmissionStatusBadge } from '../components/common/StatusBadge'
import { useVisibleUsers } from '../hooks/useUsers'
import { useQuery } from '@tanstack/react-query'
import { getWorkTypes } from '../api/workTypesApi'
import { searchReports } from '../api/reportsApi'
import { fmt } from '../utils/dateUtils'

const { Title } = Typography

export default function ReportExplorerPage() {
  const nav = useNavigate()
  const location = useLocation()
  const [filters, setFilters] = useState(null)
  const { data: users } = useVisibleUsers()
  const { data: workTypes } = useQuery({ queryKey: ['work-types'], queryFn: () => getWorkTypes().then(r => r.data) })
  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ['report-explorer', filters],
    queryFn: () => searchReports(filters || {}).then(r => r.data),
    enabled: !!filters,
  })

  // Restore filters from navigation state
  useEffect(() => {
    if (location.state?.filters) {
      setFilters(location.state.filters)
    }
  }, [location.state])

  const cols = [
    { title: 'Member', dataIndex: ['user', 'name'], key: 'name', width: 150, ellipsis: true },
    { title: 'Date', dataIndex: 'report_date', render: fmt, width: 100 },
    { title: 'Tasks', dataIndex: 'tasks', render: t => t?.length, width: 80 },
    { title: 'Work Types', dataIndex: 'tasks', render: tasks => (
      <Space wrap>{[...new Set(tasks?.map(t => t.work_type?.label))].map(l => <Tag key={l}>{l}</Tag>)}</Space>
    ), width: 200 },
    { title: 'Late?', dataIndex: 'is_late', render: v => v ? <Tag color="orange">Late</Tag> : null, width: 80 },
    { title: 'Blockers', dataIndex: 'blockers', render: v => v ? <Tag color="red">Yes</Tag> : null, width: 90 },
    { title: 'Review', dataIndex: 'review_status', render: s => <ReviewStatusBadge status={s} />, width: 100 },
    { key: 'action', render: (_, r) => <Button size="small" onClick={() => nav(`/reports/${r.id}`, { state: { filters } })}>View</Button>, width: 80, fixed: 'right' },
  ]

  return (
    <>
      <Title level={4}>Report Explorer</Title>
      <ReportFilterBar users={users} workTypes={workTypes} onSearch={f => setFilters(f)} loading={isLoading} />
      {filters && <Table dataSource={reports} columns={cols} rowKey="id" loading={isLoading} scroll={{ x: 800 }} />}
    </>
  )
}
