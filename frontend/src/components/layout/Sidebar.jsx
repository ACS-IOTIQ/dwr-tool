
// ── frontend/src/components/layout/Sidebar.jsx ──────────────────
import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppstoreOutlined, FileAddOutlined, FileTextOutlined,
  TeamOutlined, SearchOutlined, UserOutlined,
  TagsOutlined, CalendarOutlined, BarChartOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'
import { isAdmin, isRM, ROLE_LABELS } from '../../utils/roleUtils'
import { useVisibleUsers } from '../../hooks/useUsers'

const { Sider } = Layout

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')

export default function Sidebar() {
  const nav = useNavigate()
  const loc = useLocation()
  const { user } = useAuthStore()
  const { data: allUsers } = useVisibleUsers()
  const admin = isAdmin(user)
  const rm = isRM(user, allUsers)

  const items = [
    { key: '/dashboard',       icon: <AppstoreOutlined />, label: 'Dashboard' },
    { key: '/submit-report',   icon: <FileAddOutlined />,   label: 'Submit Report' },
    { key: '/my-reports',      icon: <FileTextOutlined />,  label: 'My Reports' },
    (admin || rm) && { key: '/team-status',     icon: <TeamOutlined />,     label: 'Team Status' },
    (admin || rm) && { key: '/report-explorer', icon: <SearchOutlined />,   label: 'Report Explorer' },
    (admin || rm) && { key: '/analyze',         icon: <BarChartOutlined />, label: 'Analyze' },
    admin && { type: 'divider' },
    admin && { key: '/users',       icon: <UserOutlined />,  label: 'Users' },
    admin && { key: '/work-types',  icon: <TagsOutlined />,  label: 'Work Types' },
    admin && { key: '/leave',       icon: <CalendarOutlined />, label: 'Leave' },
  ].filter(Boolean)

  return (
    <Sider collapsible breakpoint="lg" width={196} className="app-sider">
      <div className="app-brand">
        <span className="app-brand-mark">DWR</span>
        <span className="app-brand-text">Tool</span>
      </div>
      <Menu
        theme="dark"
        selectedKeys={[loc.pathname]}
        mode="inline"
        className="app-sider-menu"
        items={items}
        inlineIndent={18}
        onClick={({ key }) => nav(key)}
      />
      <div className="app-sider-footer">
        <div className="app-sider-user">
          <div className="app-sider-avatar">{initials(user?.name)}</div>
          <div className="app-sider-user-meta">
            <span className="app-sider-user-name">{user?.name}</span>
            <span className="app-sider-user-role">{ROLE_LABELS[user?.role]}</span>
          </div>
        </div>
      </div>
    </Sider>
  )
}
