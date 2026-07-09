// ── frontend/src/components/reports/TaskRow.jsx ──────────────────
import { Form, Input, Select, InputNumber, Button, Space } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

export default function TaskRow({ name, workTypes, onRemove, isOnly }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #f0f0f0',
      borderRadius: 10,
      padding: '14px 16px',
      marginBottom: 10,
    }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Form.Item name={[name, 'work_type_id']} rules={[{ required: true, message: 'Required' }]} style={{ marginBottom: 0, flex: '1 1 160px' }}>
            <Select placeholder="Work Type" style={{ width: '100%' }}>
              {workTypes?.map(wt => <Select.Option key={wt.id} value={wt.id}>{wt.label}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name={[name, 'status']} style={{ marginBottom: 0, flex: '0 0 150px' }}>
            <Select style={{ width: '100%' }}>
              <Select.Option value="DONE">Done</Select.Option>
              <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
              <Select.Option value="CARRIED_OVER">Carried Over</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name={[name, 'time_spent_hours']} style={{ marginBottom: 0, flex: '0 0 100px' }}>
            <InputNumber placeholder="Hours" min={0} max={24} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          {!isOnly && (
            <Button icon={<DeleteOutlined />} danger type="text" onClick={onRemove} style={{ marginTop: 1 }} />
          )}
        </div>
        <Form.Item name={[name, 'task_description']} rules={[{ required: true, message: 'Describe task' }]} style={{ marginBottom: 0 }}>
          <Input.TextArea
            rows={2}
            placeholder="Describe what you worked on..."
            style={{ resize: 'none', fontSize: 13 }}
          />
        </Form.Item>
        <Form.Item name={[name, 'notes']} style={{ marginBottom: 0 }}>
          <Input placeholder="Notes (optional)" style={{ fontSize: 13, color: '#a0a0a0' }} />
        </Form.Item>
      </Space>
    </div>
  )
}
