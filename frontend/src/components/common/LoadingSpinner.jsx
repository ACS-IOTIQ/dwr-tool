
// ── frontend/src/components/common/LoadingSpinner.jsx ────────────
import { Spin } from 'antd'

export default function LoadingSpinner({ tip = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <Spin tip={tip} size="large" />
    </div>
  )
}
