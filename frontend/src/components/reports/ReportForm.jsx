
// ── frontend/src/components/reports/ReportForm.jsx ───────────────
import { useState } from 'react'
import { Form, Button, DatePicker, Input, Rate, Space, Typography, Divider, Card, message } from 'antd'
import { PlusOutlined, CalendarOutlined, ImportOutlined } from '@ant-design/icons'
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

  const SectionLabel = ({ children }) => (
    <div style={{
      fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: '#a0a0a0',
      marginBottom: 12, marginTop: 8,
    }}>
      {children}
    </div>
  )

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ report_date: dayjs(), tasks: [{ status: 'DONE' }] }}
    >
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 500, color: '#1a1a1a' }}>
          Daily Work Report
        </Title>
        <span style={{ fontSize: 13, color: '#a0a0a0' }}>
          Log your tasks and progress for the day
        </span>
      </div>

      <SectionLabel>Report Date</SectionLabel>
      <Form.Item name="report_date" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
        <DatePicker
          style={{ width: 200 }}
          disabledDate={d => d && d > dayjs()}
          suffixIcon={<CalendarOutlined style={{ color: '#a0a0a0' }} />}
        />
      </Form.Item>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <SectionLabel>Tasks</SectionLabel>
        <Button
          size="small"
          icon={<ImportOutlined />}
          onClick={handleImportFromCommits}
          loading={isImporting}
          style={{ fontSize: 12, color: '#a0a0a0', border: '1px solid #f0f0f0' }}
        >
          Import from Commits
        </Button>
      </div>

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
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => add({ status: 'DONE' })}
              style={{ width: '100%', marginBottom: 20, borderColor: '#e8e8e8', color: '#a0a0a0', fontSize: 13 }}
            >
              Add Task
            </Button>
          </>
        )}
      </Form.List>

      <SectionLabel>Summary</SectionLabel>
      <Form.Item name="plan_for_tomorrow" label="Plan for Tomorrow" style={{ marginBottom: 14 }}>
        <Input.TextArea rows={2} placeholder="What will you work on tomorrow?" style={{ resize: 'none', fontSize: 13 }} />
      </Form.Item>
      <Form.Item name="blockers" label="Blockers / Impediments" style={{ marginBottom: 14 }}>
        <Input.TextArea rows={2} placeholder="Any blockers? Leave blank if none." style={{ resize: 'none', fontSize: 13 }} />
      </Form.Item>
      <Form.Item name="mood_rating" label="Energy / Mood (optional)" style={{ marginBottom: 24 }}>
        <Rate count={5} />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" loading={loading} size="large" style={{ fontWeight: 500, paddingInline: 32 }}>
          Submit Report
        </Button>
      </Form.Item>
    </Form>
  )
}
