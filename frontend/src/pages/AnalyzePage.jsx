// ── frontend/src/pages/AnalyzePage.jsx ─────────────────────────────
import { Typography, Form, Select, DatePicker, Button, Row, Col, Table, Space } from 'antd'
import { useState } from 'react'
import dayjs from 'dayjs'
import { useVisibleUsers } from '../hooks/useUsers'
import { useReportAnalysis } from '../hooks/useReports'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export default function AnalyzePage() {
  const [form] = Form.useForm()
  const [filters, setFilters] = useState(null)
  const { data: users, isLoading: usersLoading } = useVisibleUsers()
  const { data: results, isLoading } = useReportAnalysis(filters)

  const handleAnalyze = (vals) => {
    const range = vals.date_range
    if (!range?.length) return
    setFilters({
      user_id: vals.user_id || null,
      date_from: range[0].format('YYYY-MM-DD'),
      date_to: range[1].format('YYYY-MM-DD'),
    })
  }

  const cols = [
    { title: 'Member', dataIndex: ['user', 'name'], key: 'name', width: 160 },
    { title: 'Working Days', dataIndex: 'working_days', width: 120 },
    { title: 'Reports Missed', dataIndex: 'missed_reports', width: 130 },
    { title: 'Underworked Days', dataIndex: 'underworked_days', width: 140 },
    { title: 'Abnormal Duration', dataIndex: 'abnormal_duration_days', width: 150 },
    { title: 'Sunday Reports', dataIndex: 'sunday_reports', width: 130 },
    { title: 'Blank Plan', dataIndex: 'blank_plan_reports', width: 110 },
  ]

  return (
    <>
      <Title level={4}>Analyze</Title>
      <Text type="secondary">
        Underworked: &lt; 6h (Mon-Fri) and &lt; 3h (Sat). Working days exclude Sundays, holidays, 2nd Saturdays, and leave.
      </Text>
      <Form form={form} layout="vertical" onFinish={handleAnalyze} style={{ marginTop: 16 }}>
        <Row gutter={12}>
          <Col span={6}>
            <Form.Item name="user_id" label="Team Member">
              <Select
                placeholder="All members"
                allowClear
                loading={usersLoading}
                optionFilterProp="children"
                showSearch
              >
                {users?.map(u => (
                  <Select.Option key={u.id} value={u.id}>{u.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="date_range"
              label="Date Range"
              rules={[{ required: true, message: 'Select a date range' }]}
            >
              <RangePicker
                style={{ width: '100%' }}
                disabledDate={d => d > dayjs()}
              />
            </Form.Item>
          </Col>
          <Col span={6} style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={isLoading}>Analyze</Button>
              <Button
                onClick={() => {
                  form.resetFields()
                  setFilters(null)
                }}
              >
                Clear
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
      {filters && (
        <Table
          dataSource={results || []}
          columns={cols}
          rowKey={r => r.user.id}
          loading={isLoading}
          scroll={{ x: 900 }}
          pagination={{ pageSize: 10 }}
        />
      )}
    </>
  )
}
