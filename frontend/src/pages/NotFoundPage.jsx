
// ── frontend/src/pages/NotFoundPage.jsx ─────────────────────────
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const nav = useNavigate()
  return <Result status="404" title="404" subTitle="Page not found" extra={<Button type="primary" onClick={() => nav('/')}>Go Home</Button>} />
}