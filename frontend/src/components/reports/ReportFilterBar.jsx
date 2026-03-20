
// ── frontend/src/components/reports/ReportFilterBar.jsx ──────────
import { Form, Select, DatePicker, Button, Space, Row, Col } from 'antd'
import { SearchOutlined, ClearOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function ReportFilterBar({ users, workTypes, onSearch, loading }) {
  const [form] = Form.useForm()

  const handleSearch = () => {
    const vals = form.getFieldsValue()
    const filters = {
      user_ids: vals.user_ids?.length ? vals.user_ids : null,
      work_type_ids: vals.work_type_ids?.length ? vals.work_type_ids : null,
      date_from: vals.date_range?.[0]?.format('YYYY-MM-DD') || null,
      date_to: vals.date_range?.[1]?.format('YYYY-MM-DD') || null,
      review_status: vals.review_status || null,
      is_late: vals.is_late ?? null,
      has_blockers: vals.has_blockers ?? null,
    }
    onSearch(filters)
  }

  return (
    <Form form={form} layout="vertical">
      <Row gutter={12}>
        <Col span={6}>
          <Form.Item name="user_ids" label="Team Member">
            <Select mode="multiple" placeholder="All members" allowClear>
              {users?.map(u => <Select.Option key={u.id} value={u.id}>{u.name}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="work_type_ids" label="Work Type">
            <Select mode="multiple" placeholder="All types" allowClear>
              {workTypes?.map(w => <Select.Option key={w.id} value={w.id}>{w.label}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="date_range" label="Date Range">
            <RangePicker style={{ width: '100%' }}
              presets={[
                { label: 'Today', value: [dayjs(), dayjs()] },
                { label: 'This Week', value: [dayjs().startOf('week'), dayjs()] },
                { label: 'Last Week', value: [dayjs().subtract(1,'week').startOf('week'), dayjs().subtract(1,'week').endOf('week')] },
                { label: 'This Month', value: [dayjs().startOf('month'), dayjs()] },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item name="review_status" label="Review Status">
            <Select allowClear placeholder="Any">
              {['PENDING','REVIEWED','FLAGGED'].map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={3} style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 24 }}>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>Search</Button>
            <Button icon={<ClearOutlined />} onClick={() => { form.resetFields(); onSearch({}) }}>Clear</Button>
          </Space>
        </Col>
      </Row>
    </Form>
  )
}

