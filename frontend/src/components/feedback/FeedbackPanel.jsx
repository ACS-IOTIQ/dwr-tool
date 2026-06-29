
// ── frontend/src/components/feedback/FeedbackPanel.jsx ───────────
import FeedbackCard from './FeedbackCard'
import { useFeedback } from '../../hooks/useFeedback'
import EmptyState from '../common/EmptyState'

export default function FeedbackPanel({ reportId }) {
  const { data: feedbacks, isLoading } = useFeedback(reportId)

  if (isLoading) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {feedbacks?.length
        ? feedbacks.map(fb => <FeedbackCard key={fb.id} fb={fb} />)
        : <EmptyState description="No feedback yet" />
      }
    </div>
  )
}

