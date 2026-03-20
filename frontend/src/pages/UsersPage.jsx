import { Button, Table, Space, Popconfirm, Tag, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useUsers, useCreateUser, useUpdateUser, useDeactivateUser } from '../hooks/useUsers'
import UserForm from '../components/users/UserForm'
import { ROLE_LABELS } from '../utils/roleUtils'

const { Title } = Typography

export default function UsersPage() {
  const { data: users, isLoading } = useUsers()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deactivateUser = useDeactivateUser()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const cols = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: r => <Tag>{ROLE_LABELS[r] || r}</Tag>,
    },
    {
      title: 'Reporting To',
      dataIndex: 'reporting_manager_name',
      render: v => v || '—',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      render: v => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      key: 'action',
      render: (_, u) => (
        <Space>
          <Button
            size="small"
            onClick={() => { setEditing(u); setModalOpen(true) }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Deactivate this user?"
            onConfirm={() => deactivateUser.mutate(u.id)}
            disabled={!u.is_active}
          >
            <Button size="small" danger disabled={!u.is_active}>
              Deactivate
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Users</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditing(null); setModalOpen(true) }}
        >
          Add User
        </Button>
      </Space>

      <Table
        dataSource={users}
        columns={cols}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 15 }}
      />

      <UserForm
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        initialValues={editing}
        onSubmit={vals => {
          if (editing) {
            updateUser.mutate({ id: editing.id, data: vals })
          } else {
            createUser.mutate(vals)
          }
          setModalOpen(false)
          setEditing(null)
        }}
        loading={createUser.isPending || updateUser.isPending}
      />
    </>
  )
}