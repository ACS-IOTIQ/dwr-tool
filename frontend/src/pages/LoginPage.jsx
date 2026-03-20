// ── frontend/src/pages/LoginPage.jsx ────────────────────────────
import { Form, Input, Button, Card, Typography, Alert } from 'antd'
import { useLogin } from '../hooks/useAuth'

const { Title } = Typography

export default function LoginPage() {
  const { mutate: doLogin, isPending, error } = useLogin()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 360, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>📋 DWR Tool</Title>
        {error && <Alert type="error" message={error.response?.data?.detail || 'Login failed'} style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={doLogin}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input autoFocus />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>Login</Button>
        </Form>
      </Card>
    </div>
  )
}
