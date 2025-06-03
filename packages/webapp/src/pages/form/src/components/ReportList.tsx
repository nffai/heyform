import { useTranslation } from '@heyform-inc/form-renderer/src'
import { FC } from 'react'

import { ReportItem } from './ReportItem'

interface ReportListProps {
  form: Any
  responses: Any[]
  locale: string
}

export const ReportList: FC<ReportListProps> = ({ form, responses, locale }) => {
  const { t } = useTranslation()

  return (
    <div className="relative z-10 mx-auto max-w-4xl py-32">
      <h2 className="heyform-report-heading">{form.name}</h2>
      <p className="heyform-report-subheading">
        {t('reportMeta', { count: form.submissions || 0 })}
      </p>

      <ol className="heyform-report-items mt-6 space-y-8">
        {responses.map((row, index) => (
          <ReportItem
            key={index}
            index={index + 1}
            formId={form.id}
            response={row}
            locale={locale}
          />
        ))}
      </ol>
    </div>
  )
}
