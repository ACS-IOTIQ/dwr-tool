
// ── frontend/src/components/layout/AppShell.jsx ─────────────────
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const { Content } = Layout

export default function AppShell() {
  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <Layout style={{ height: '100vh' }}>
        <Topbar />
        <Content style={{ flex: 1, minHeight: 0, overflowY: 'auto', margin: '20px 16px', padding: 0, background: 'transparent' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

