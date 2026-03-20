
// ── frontend/src/components/layout/Sidebar.jsx ──────────────────
import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined, FileAddOutlined, FileTextOutlined,
  TeamOutlined, SearchOutlined, UserOutlined,
  TagsOutlined, CalendarOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'
import { isAdmin, isRM } from '../../utils/roleUtils'
import { useUsers } from '../../hooks/useUsers'

const { Sider } = Layout

export default function Sidebar() {
  const nav = useNavigate()
  const loc = useLocation()
  const { user } = useAuthStore()
  const { data: allUsers } = useUsers()
  const admin = isAdmin(user)
  const rm = isRM(user, allUsers)

  const items = [
    { key: '/dashboard',       icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/submit-report',   icon: <FileAddOutlined />,   label: 'Submit Report' },
    { key: '/my-reports',      icon: <FileTextOutlined />,  label: 'My Reports' },
    (admin || rm) && { key: '/team-status',     icon: <TeamOutlined />,     label: 'Team Status' },
    (admin || rm) && { key: '/report-explorer', icon: <SearchOutlined />,   label: 'Report Explorer' },
    admin && { type: 'divider' },
    admin && { key: '/users',       icon: <UserOutlined />,  label: 'Users' },
    admin && { key: '/work-types',  icon: <TagsOutlined />,  label: 'Work Types' },
    admin && { key: '/leave',       icon: <CalendarOutlined />, label: 'Leave' },
  ].filter(Boolean)

  return (
    <Sider collapsible breakpoint="lg" style={{ background: '#001529' }}>
      <div style={{ color: '#fff', textAlign: 'center', padding: '16px 8px', fontWeight: 700, fontSize: 15 }}>
        DWR Tool
      </div>
      <Menu
        theme="dark"
        selectedKeys={[loc.pathname]}
        mode="inline"
        items={items}
        onClick={({ key }) => nav(key)}
      />
    </Sider>
  )
}
