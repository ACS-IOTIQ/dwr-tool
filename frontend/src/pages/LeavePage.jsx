import { Table, Button, Modal, Form, Select, DatePicker, Popconfirm, Space, Typography, Alert } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLeaves, markLeave, removeLeave } from '../api/leaveApi'
import { getUsers } from '../api/usersApi'
import { fmt } from '../utils/dateUtils'
import { message } from 'antd'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

const { Title } = Typography

export default function LeavePage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: leaves, isLoading: leavesLoading, error: leavesError } = useQuery({
    queryKey: ['leaves'],
    queryFn: () => getLeaves().then(r => r.data),
  })

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers().then(r => r.data),
  })

  const mark = useMutation({
    mutationFn: vals => markLeave({
      user_id: vals.user_id,
      leave_date: vals.leave_date.format('YYYY-MM-DD'),
      reason: vals.reason || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries(['leaves'])
      setOpen(false)
      form.resetFields()
      message.success('Leave marked')
    },
    onError: e => message.error(e.response?.data?.detail || 'Failed to mark leave'),
  })

  const remove = useMutation({
    mutationFn: removeLeave,
    onSuccess: () => {
      qc.invalidateQueries(['leaves'])
      message.success('Leave removed')
    },
    onError: e => message.error(e.response?.data?.detail || 'Failed to remove leave'),
  })

  const userMap = Object.fromEntries(users?.map(u => [u.id, u.name]) || [])

  const cols = [
    {
      title: 'Team Member',
      dataIndex: 'user_id',
      render: id => userMap[id] || `User #${id}`,
    },
    {
      title: 'Date',
      dataIndex: 'leave_date',
      render: fmt,
      sorter: (a, b) => a.leave_date.localeCompare(b.leave_date),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      render: v => v || '—',
    },
    {
      title: 'Marked By',
      dataIndex: 'marked_by_id',
      render: id => userMap[id] || `User #${id}`,
    },
    {
      key: 'action',
      render: (_, r) => (
        <Popconfirm
          title="Remove this leave record?"
          onConfirm={() => remove.mutate(r.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button size="small" danger loading={remove.isPending}>Remove</Button>
        </Popconfirm>
      ),
    },
  ]

  if (leavesLoading || usersLoading) return <LoadingSpinner />
  if (leavesError) return <Alert type="error" message={`Error: ${leavesError.message}`} />

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Leave Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { form.resetFields(); setOpen(true) }}
        >
          Mark Leave
        </Button>
      </Space>

      {leaves?.length
        ? <Table dataSource={leaves} columns={cols} rowKey="id" pagination={{ pageSize: 10 }} />
        : <EmptyState description="No leave records" />
      }

      <Modal
        title="Mark Leave"
        open={open}
        onCancel={() => { setOpen(false); form.resetFields() }}
        onOk={() => form.validateFields().then(v => mark.mutate(v))}
        confirmLoading={mark.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="user_id"
            label="Team Member"
            rules={[{ required: true, message: 'Please select a team member' }]}
          >
            <Select
              showSearch
              placeholder="Select member"
              optionFilterProp="children"
            >
              {users?.map(u => (
                <Select.Option key={u.id} value={u.id}>{u.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="leave_date"
            label="Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="Reason (optional)">
            <Form.Item name="reason" noStyle>
              <Select placeholder="Select reason" allowClear>
                <Select.Option value="Sick Leave">Sick Leave</Select.Option>
                <Select.Option value="Casual Leave">Casual Leave</Select.Option>
                <Select.Option value="Public Holiday">Public Holiday</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}