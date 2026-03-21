
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
    <Header className="app-topbar">
      <Space size={16} align="center">
        <Badge count={unreadCount} size="small">
          <Button className="topbar-icon-btn" icon={<BellOutlined />} type="text" onClick={() => setDrawerOpen(true)} />
        </Badge>
        <div className="app-user">
          <Avatar>{user?.name?.[0]?.toUpperCase()}</Avatar>
          <div className="app-user-meta">
            <Text className="app-user-name">{user?.name}</Text>
            <Text className="app-user-role">{ROLE_LABELS[user?.role]}</Text>
          </div>
        </div>
        <Button className="topbar-icon-btn" icon={<LogoutOutlined />} type="text" onClick={logout} />
      </Space>
      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Header>
  )
}
