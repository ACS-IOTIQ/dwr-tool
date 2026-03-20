import { Alert, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import ReportForm from '../components/reports/ReportForm'
import { useSubmitReport } from '../hooks/useReports'
import { getWorkTypes } from '../api/workTypesApi'

export default function SubmitReportPage() {
  const { data: workTypes } = useQuery({
    queryKey: ['work-types'],
    queryFn: () => getWorkTypes().then(r => r.data)
  })
  const { mutate: submit, isPending, isSuccess } = useSubmitReport()

  return (
    <div style={{ maxWidth: 780 }}>
      {isSuccess && (
        <Alert type="success" message="Report submitted!" showIcon style={{ marginBottom: 16 }} />
      )}
      <ReportForm
        workTypes={workTypes}
        onSubmit={data => submit(data)}
        loading={isPending}
      />
    </div>
  )
}