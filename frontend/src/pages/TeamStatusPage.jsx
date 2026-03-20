
// ── frontend/src/pages/TeamStatusPage.jsx ───────────────────────
import { Typography, DatePicker, Space } from 'antd'
import { useState } from 'react'
import dayjs from 'dayjs'
import { useDailyStatus } from '../hooks/useReports'
import ReportStatusGrid from '../components/reports/ReportStatusGrid'
import { toApiDate } from '../utils/dateUtils'

const { Title } = Typography

export default function TeamStatusPage() {
  const [date, setDate] = useState(dayjs())
  const { data, isLoading } = useDailyStatus(toApiDate(date))

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Team Status</Title>
        <DatePicker value={date} onChange={setDate} disabledDate={d => d > dayjs()} allowClear={false} />
      </Space>
      <ReportStatusGrid data={data} loading={isLoading} />
    </>
  )
}
