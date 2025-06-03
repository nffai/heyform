import { useTranslation } from '@heyform-inc/form-renderer/src'
import { CHOICE_FIELD_KINDS, RATING_FIELD_KINDS } from '@heyform-inc/shared-types-enums'
import { helper, toFixed } from '@heyform-inc/utils'
import { FC, useMemo } from 'react'

import ReportSubmissions from './ReportSubmissions'

interface ReportItemProps {
  index: number
  formId: string
  response: Any
  locale: string
}

interface ChoicesProps {
  chooses: Any[]
}

interface RatingsProps extends ChoicesProps {
  length: number
}

const Choices: FC<ChoicesProps> = ({ chooses }) => {
  const { t } = useTranslation()
  const total = useMemo(() => chooses.reduce((prev, next) => prev + next.count, 0) || 1, [chooses])

  return (
    <div className="heyform-report-chart">
      {chooses.map((row, index) => {
        const percent = `${toFixed((row.count * 100) / total)}%`

        return (
          <div key={index} className="heyform-report-chart-item">
            <div
              className="heyform-report-chart-background"
              style={{
                width: percent
              }}
            />
            <div className="heyform-report-chart-content">
              <span className="heyform-report-chart-percent">
                {row.label} · {percent}
              </span>
              <span className="heyform-report-chart-count">
                {t('reportSubmission', { count: row.count })}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const Ratings: FC<RatingsProps> = ({ length, chooses }) => {
  const { t } = useTranslation()
  const arrays = Array.from<number>({ length }).map((_, index) => index + 1)
  const total = chooses.filter(c => helper.isNumeric(c)).reduce((prev, next) => prev + next, 0)

  return (
    <div className="heyform-report-chart">
      {arrays.map((row, index) => {
        const count = chooses[row] || 0
        const percent = `${toFixed((count * 100) / total)}%`

        return (
          <div key={index} className="heyform-report-chart-item">
            <div
              className="heyform-report-chart-background"
              style={{
                width: percent
              }}
            />
            <div className="heyform-report-chart-content">
              <span className="heyform-report-chart-percent">
                {row} · {total > 0 ? Math.round((count * 100) / total) : 0}%
              </span>
              <span className="heyform-report-chart-count">{t('reportSubmission', { count })}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const ReportItem: FC<ReportItemProps> = ({ index, formId, response, locale }) => {
  const { t } = useTranslation()

  const isChoices = useMemo(() => CHOICE_FIELD_KINDS.includes(response.kind), [response.kind])
  const isRating = useMemo(() => RATING_FIELD_KINDS.includes(response.kind), [response.kind])

  const children = useMemo(() => {
    if (isChoices) {
      return <Choices chooses={response.chooses} />
    } else if (isRating) {
      return <Ratings length={response.properties?.total} chooses={response.chooses} />
    } else {
      return <ReportSubmissions formId={formId} response={response} locale={locale} />
    }
  }, [formId, isChoices, isRating, locale, response])

  return (
    <li className="heyform-report-item">
      <div className="flex gap-4">
        <div className="heyform-report-question flex-1">
          {index}. {response.title}
        </div>
      </div>
      <div className="heyform-report-meta">
        {isRating
          ? t('reportSubmission2', {
              count: response.count,
              average: response.average
            })
          : t('reportSubmission', { count: response.count })}
      </div>

      <div className="heyform-report-content">{children}</div>
    </li>
  )
}
