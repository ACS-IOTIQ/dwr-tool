import { Modal, Form, Input, Select, Divider } from 'antd'
import { useManagers } from '../../hooks/useUsers'
import { useEffect } from 'react'

export default function UserForm({ open, onClose, onSubmit, initialValues, loading }) {
  const [form] = Form.useForm()
  const { data: managers } = useManagers()
  const isEditing = !!initialValues?.id

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues || { role: 'TEAM_MEMBER' })
    } else {
      form.resetFields()
    }
  }, [open, initialValues])

  const handleOk = () => {
    form.validateFields().then(vals => {
      // Remove new_password if left blank during edit
      if (isEditing && !vals.new_password) {
        delete vals.new_password
      }
      onSubmit(vals)
      onClose()
    })
  }

  return (
    <Modal
      title={isEditing ? 'Edit User' : 'Add User'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: 'Please enter full name' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
        >
          <Input />
        </Form.Item>

        {/* New user — password required */}
        {!isEditing && (
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}
          >
            <Input.Password placeholder="Set initial password" />
          </Form.Item>
        )}

        {/* Editing — password optional */}
        {isEditing && (
          <>
            <Divider orientation="left" plain style={{ fontSize: 12, color: '#888' }}>
              Change Password (leave blank to keep current)
            </Divider>
            <Form.Item
              name="new_password"
              label="New Password"
              rules={[
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password placeholder="Leave blank to keep current password" />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="ADMIN">Admin / HOD</Select.Option>
            <Select.Option value="TEAM_MEMBER">Team Member</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="reporting_manager_id" label="Primary Reporting Manager">
          <Select allowClear placeholder="None">
            {managers
              ?.filter(m => m.id !== initialValues?.id)
              .map(m => (
                <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>
              ))
            }
          </Select>
        </Form.Item>

        <Form.Item name="secondary_manager_id" label="Secondary Reporting Manager">
          <Select allowClear placeholder="None">
            {managers
              ?.filter(m => m.id !== initialValues?.id)
              .map(m => (
                <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>
              ))
            }
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}