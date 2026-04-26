
// ── frontend/src/components/reports/ReportForm.jsx ───────────────
import { useState } from 'react'
import { Form, Button, DatePicker, Input, Rate, Space, Typography, Divider, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import TaskRow from './TaskRow'
import { getMyCommitTasks } from '../../api/commitTasksApi'

const { Title } = Typography

export default function ReportForm({ workTypes, onSubmit, loading }) {
  const [form] = Form.useForm()
  const [isImporting, setIsImporting] = useState(false)
  const reportDate = Form.useWatch('report_date', form)

  const handleFinish = (vals) => {
    const payload = {
      report_date: vals.report_date.format('YYYY-MM-DD'),
      plan_for_tomorrow: vals.plan_for_tomorrow,
      blockers: vals.blockers,
      mood_rating: vals.mood_rating,
      tasks: (vals.tasks || []).map(({ commit_sha, ...task }) => task),
    }
    onSubmit(payload)
  }

  const handleImportFromCommits = async () => {
    if (!reportDate) {
      message.warning('Select a report date first')
      return
    }

    setIsImporting(true)
    try {
      const selectedDate = reportDate.format('YYYY-MM-DD')
      const { data } = await getMyCommitTasks({
        date_from: selectedDate,
        date_to: selectedDate,
        status: 'IMPORTED',
      })

      if (!data?.length) {
        message.info('No imported commits found for that date')
        return
      }

      const existingTasks = form.getFieldValue('tasks') || []
      const existingImportedShas = new Set(
        existingTasks
          .map(task => task?.commit_sha)
          .filter(Boolean)
      )

      const newTasks = data
        .filter(commit => !existingImportedShas.has(commit.commit_sha))
        .map(commit => ({
          work_type_id: undefined,
          status: 'DONE',
          time_spent_hours: null,
          task_description: commit.commit_message,
          notes: commit.repository_name
            ? `Imported from ${commit.repository_name} (${commit.commit_sha.slice(0, 7)})`
            : `Imported from commit ${commit.commit_sha.slice(0, 7)}`,
          commit_sha: commit.commit_sha,
        }))

      if (!newTasks.length) {
        message.info('These commits are already added to the form')
        return
      }

      form.setFieldsValue({
        tasks: [...existingTasks, ...newTasks],
      })
      message.success(`Imported ${newTasks.length} commit task${newTasks.length > 1 ? 's' : ''}`)
    } catch (e) {
      const detail = e.response?.data?.detail
      message.error(detail || 'Failed to fetch commit tasks')
    } finally {
      setIsImporting(false)
    }
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
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={handleImportFromCommits} loading={isImporting}>
          Fetch Tasks From Commits
        </Button>
      </Space>
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
