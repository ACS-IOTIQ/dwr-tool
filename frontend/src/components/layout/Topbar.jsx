
// ── frontend/src/components/layout/Topbar.jsx ───────────────────
import { Layout, Space, Badge, Button, Typography } from 'antd'
import { BellOutlined, LogoutOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { useLogout } from '../../hooks/useAuth'
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
      <div className="app-topbar-greeting">
        <Text className="app-topbar-welcome">Welcome back, {user?.name}</Text>
        <Text className="app-topbar-date">{dayjs().format('dddd, MMMM D, YYYY')}</Text>
      </div>
      <Space size={10} align="center">
        <Badge count={unreadCount} className="topbar-badge">
          <Button className="topbar-icon-btn" icon={<BellOutlined />} type="text" onClick={() => setDrawerOpen(true)} />
        </Badge>
        <Button className="topbar-icon-btn" icon={<LogoutOutlined />} type="text" onClick={logout} />
      </Space>
      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Header>
  )
}
