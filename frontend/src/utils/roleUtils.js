
// ── frontend/src/utils/roleUtils.js ──────────────────────────────
export const isAdmin = (user) => user?.role === 'ADMIN'
export const isRM = (user, allUsers) =>
  allUsers?.some(u =>
    u.reporting_manager_id === user?.id || u.secondary_manager_id === user?.id
  )
export const canReview = (user, allUsers) =>
  isAdmin(user) || isRM(user, allUsers)

export const ROLE_LABELS = {
  ADMIN: 'Admin / HOD',
  TEAM_MEMBER: 'Team Member',
}

export const STATUS_COLORS = {
  SUBMITTED: 'green',
  LATE:      'orange',
  MISSING:   'red',
  ON_LEAVE:  'default',
}

export const REVIEW_STATUS_COLORS = {
  PENDING:  'blue',
  REVIEWED: 'green',
  FLAGGED:  'red',
}
