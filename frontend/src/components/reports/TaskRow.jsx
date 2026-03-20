// ── frontend/src/components/reports/TaskRow.jsx ──────────────────
import { Form, Input, Select, InputNumber, Button, Space } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

export default function TaskRow({ name, workTypes, onRemove, isOnly }) {
  return (
    <div style={{ background: '#fafafa', padding: 12, borderRadius: 6, marginBottom: 8 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space wrap style={{ width: '100%' }}>
          <Form.Item name={[name, 'work_type_id']} rules={[{ required: true, message: 'Required' }]} style={{ marginBottom: 0 }}>
            <Select placeholder="Work Type" style={{ width: 180 }}>
              {workTypes?.map(wt => <Select.Option key={wt.id} value={wt.id}>{wt.label}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name={[name, 'status']} style={{ marginBottom: 0 }}>
            <Select style={{ width: 150 }}>
              <Select.Option value="DONE">Done</Select.Option>
              <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
              <Select.Option value="CARRIED_OVER">Carried Over</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name={[name, 'time_spent_hours']} style={{ marginBottom: 0 }}>
            <InputNumber placeholder="Hours" min={0} max={24} step={0.5} style={{ width: 100 }} />
          </Form.Item>
          {!isOnly && (
            <Button icon={<DeleteOutlined />} danger type="text" onClick={onRemove} />
          )}
        </Space>
        <Form.Item name={[name, 'task_description']} rules={[{ required: true, message: 'Describe task' }]} style={{ marginBottom: 0 }}>
          <Input.TextArea rows={2} placeholder="Task description..." />
        </Form.Item>
        <Form.Item name={[name, 'notes']} style={{ marginBottom: 0 }}>
          <Input placeholder="Notes (optional)" />
        </Form.Item>
      </Space>
    </div>
  )
}
