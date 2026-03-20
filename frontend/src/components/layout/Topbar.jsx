
// ── frontend/src/components/layout/Topbar.jsx ───────────────────
import { Layout, Space, Avatar, Typography, Badge, Button } from 'antd'
import { BellOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { useLogout } from '../../hooks/useAuth'
import { ROLE_LABELS } from '../../utils/roleUtils'
import NotificationDrawer from '../notifications/NotificationDrawer'
import { useState } from 'react'

const { Header } = Layout
const { Text } = Typography

export default function Topbar() {
  const { user } = useAuthStore()
  const unreadCount = useNotificationStore(s => s.unreadCount)
  const logout = useLogout()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
      <Space size="large">
        <Badge count={unreadCount} size="small">
          <Button icon={<BellOutlined />} type="text" onClick={() => setDrawerOpen(true)} />
        </Badge>
        <Space>
          <Avatar>{user?.name?.[0]?.toUpperCase()}</Avatar>
          <span>
            <Text strong>{user?.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>{ROLE_LABELS[user?.role]}</Text>
          </span>
        </Space>
        <Button icon={<LogoutOutlined />} type="text" onClick={logout} />
      </Space>
      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Header>
  )
}