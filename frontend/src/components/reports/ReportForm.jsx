
// ── frontend/src/components/reports/ReportForm.jsx ───────────────
import { Form, Button, DatePicker, Input, Rate, Space, Typography, Divider } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import TaskRow from './TaskRow'

const { Title } = Typography

export default function ReportForm({ workTypes, onSubmit, loading }) {
  const [form] = Form.useForm()

  const handleFinish = (vals) => {
    const payload = {
      report_date: vals.report_date.format('YYYY-MM-DD'),
      plan_for_tomorrow: vals.plan_for_tomorrow,
      blockers: vals.blockers,
      mood_rating: vals.mood_rating,
      tasks: vals.tasks,
    }
    onSubmit(payload)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ report_date: dayjs(), tasks: [{ status: 'DONE' }] }}
    >
      <Title level={4}>Daily Work Report</Title>

      <Form.Item name="report_date" label="Report Date" rules={[{ required: true }]}>
        <DatePicker style={{ width: 200 }} disabledDate={d => d && d > dayjs()} />
      </Form.Item>

      <Divider orientation="left">Tasks</Divider>
      <Form.List name="tasks">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <TaskRow
                key={key}
                name={name}
                workTypes={workTypes}
                onRemove={() => remove(name)}
                isOnly={fields.length === 1}
              />
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({ status: 'DONE' })}>
              Add Task
            </Button>
          </>
        )}
      </Form.List>

      <Divider orientation="left">Summary</Divider>
      <Form.Item name="plan_for_tomorrow" label="Plan for Tomorrow">
        <Input.TextArea rows={2} placeholder="What will you work on tomorrow?" />
      </Form.Item>
      <Form.Item name="blockers" label="Blockers / Impediments">
        <Input.TextArea rows={2} placeholder="Any blockers? Leave blank if none." />
      </Form.Item>
      <Form.Item name="mood_rating" label="Energy / Mood (optional)">
        <Rate count={5} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} size="large">
          Submit Report
        </Button>
      </Form.Item>
    </Form>
  )
}
