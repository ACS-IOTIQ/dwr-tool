
// ── frontend/src/components/notifications/NotificationDrawer.jsx ─
import { Drawer, List, Typography, Button, Tag, Empty } from 'antd'
import { useNotifications, useMarkAllRead } from '../../hooks/useNotifications'
import { fromNow } from '../../utils/dateUtils'
import { useNavigate } from 'react-router-dom'

const TYPE_COLORS = { NEW_SUBMISSION: 'blue', FEEDBACK_GIVEN: 'green', LATE_SUBMISSION: 'orange', BROADCAST: 'purple' }

export default function NotificationDrawer({ open, onClose }) {
  const { data: notifs } = useNotifications()
  const markAll = useMarkAllRead()
  const nav = useNavigate()

  return (
    <Drawer title="Notifications" open={open} onClose={onClose} width={360}
      extra={<Button size="small" onClick={() => markAll.mutate()}>Mark all read</Button>}
    >
      {notifs?.length ? (
        <List
          dataSource={notifs}
          renderItem={n => (
            <List.Item
              style={{ background: n.is_read ? undefined : '#f0f7ff', cursor: n.report_id ? 'pointer' : 'default', padding: '8px 12px' }}
              onClick={() => { if (n.report_id) { nav(`/reports/${n.report_id}`); onClose() } }}
            >
              <List.Item.Meta
                title={<><Tag color={TYPE_COLORS[n.type]}>{n.type.replace('_',' ')}</Tag>{n.message}</>}
                description={fromNow(n.created_at)}
              />
            </List.Item>
          )}
        />
      ) : <Empty description="No notifications" />}
    </Drawer>
  )
}

