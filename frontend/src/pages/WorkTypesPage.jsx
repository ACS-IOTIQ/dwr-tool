
// ── frontend/src/pages/WorkTypesPage.jsx ────────────────────────
import { Table, Button, Modal, Form, Input, Switch, Space, Tag, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWorkTypes, createWorkType, updateWorkType } from '../api/workTypesApi'
import { message } from 'antd'

export default function WorkTypesPage() {
  const qc = useQueryClient()
  const { data: wts, isLoading } = useQuery({ queryKey: ['work-types-admin'], queryFn: () => getWorkTypes().then(r => r.data) })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const save = useMutation({
    mutationFn: vals => editing ? updateWorkType(editing.id, vals) : createWorkType(vals),
    onSuccess: () => { qc.invalidateQueries(['work-types-admin']); setOpen(false); message.success('Saved') },
  })

  const cols = [
    { title: 'Label', dataIndex: 'label' },
    { title: 'Description', dataIndex: 'description', render: v => v || '—' },
    { title: 'Active', dataIndex: 'is_active', render: v => <Tag color={v ? 'green' : 'red'}>{v ? 'Yes' : 'No'}</Tag> },
    { key: 'action', render: (_, r) => <Button size="small" onClick={() => { setEditing(r); form.setFieldsValue(r); setOpen(true) }}>Edit</Button> },
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Work Types</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setOpen(true) }}>Add</Button>
      </Space>
      <Table dataSource={wts} columns={cols} rowKey="id" loading={isLoading} />
      <Modal title={editing ? 'Edit Work Type' : 'Add Work Type'} open={open} onCancel={() => setOpen(false)}
        onOk={() => form.validateFields().then(v => save.mutate(v))} confirmLoading={save.isPending}>
        <Form form={form} layout="vertical">
          <Form.Item name="label" label="Label" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input /></Form.Item>
          {editing && <Form.Item name="is_active" label="Active" valuePropName="checked"><Switch /></Form.Item>}
        </Form>
      </Modal>
    </>
  )
}
