import { useTranslation } from '@heyform-inc/form-renderer/src'
import { Column, FieldKindEnum } from '@heyform-inc/shared-types-enums'
import { helper } from '@heyform-inc/utils'
import { useBoolean } from 'ahooks'
import { FC, useCallback, useMemo, useState } from 'react'

import axios from 'axios'

import { FormService } from '../service/form'
import { timeFromNow } from '../utils/date'
import { Pagination } from './Pagination'

interface SubmissionItemProps {
  answers: Any[]
  locale: string
}

interface InputTableItemProps extends SubmissionItemProps {
  columns: Column[]
}

const InputTableItem: FC<InputTableItemProps> = ({ columns, answers: rawAnswers = [], locale }) => {
  const answers = useMemo(
    () =>
      rawAnswers
        .map(a =>
          (a.value || []).map((value: Any) => ({
            value,
            endAt: a.endAt
          }))
        )
        .flat(),
    [rawAnswers]
  )

  return (
    <table className="w-full">
      <thead>
        <tr>
          {columns.map(c => (
            <th
              key={c.id}
              className="heyform-report-border text-secondary border-b py-2 text-sm/6 font-medium"
            >
              {c.label}
            </th>
          ))}
          <th className="heyform-report-border border-b"></th>
        </tr>
      </thead>

      <tbody className="heyform-report-divide divide-y">
        {answers.map((row: Any, index: number) => (
          <tr key={index}>
            {columns.map(c => (
              <td key={c.id} className="heyform-report-input-value">
                {row.value[c.id]}
              </td>
            ))}
            <td className="heyform-report-input-datetime">{timeFromNow(row.endAt, locale)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const AnswerValue: FC<{ answer: Any }> = ({ answer }) => {
  const { t } = useTranslation()

  switch (answer.kind) {
    case FieldKindEnum.ADDRESS:
      return (
        answer.value &&
        `${answer.value.address1}, ${answer.value.address2} ${answer.value.city}, ${answer.value.state}, ${answer.value.zip}`
      )

    case FieldKindEnum.FULL_NAME:
      return answer.value && `${answer.value.firstName} ${answer.value.lastName}`

    case FieldKindEnum.DATE_RANGE:
      return answer.value && [answer.value.start, answer.value.end].filter(Boolean).join(' - ')

    case FieldKindEnum.FILE_UPLOAD:
      return <div>{answer.value?.filename}</div>

    case FieldKindEnum.SIGNATURE:
      return <div>{t('Signature')}</div>

    default:
      return answer.value
  }
}

const SubmissionItem: FC<SubmissionItemProps> = ({ answers = [], locale }) => {
  return (
    <div className="heyform-report-divide divide-y">
      {answers.map(row => (
        <div className="heyform-report-answer" key={row.submissionId}>
          <div className="heyform-report-value">
            <AnswerValue answer={row} />
          </div>
          <div className="heyform-report-datetime">{timeFromNow(row.endAt, locale)}</div>
        </div>
      ))}
    </div>
  )
}

export default function ReportSubmissions({ formId, response, locale }: Any) {
  const [page, setPage] = useState(1)
  const [loading, { setTrue, setFalse }] = useBoolean(false)
  const [answers, setAnswers] = useState<Any[]>(response.answers || [])
  const [total, setTotal] = useState(response.count)

  const handleChange = useCallback(
    async (newPage: number) => {
      setTrue()

      try {
        const { data } = await axios.get(`/f/api/form/${formId}/answers`, {
          params: {
            fieldId: response.id,
            page: newPage
          }
        })
        const { total, answers } = data

        setAnswers(answers)
        setTotal(total)
        setPage(newPage)
      } catch (err: Any) {
        console.error(err)
      }

      setFalse()
    },
    [formId, response.id, setFalse, setTrue]
  )

  if (!helper.isValidArray(response.answers)) {
    return null
  }

  return (
    <div>
      {response.kind === FieldKindEnum.INPUT_TABLE ? (
        <InputTableItem
          answers={answers}
          columns={response.properties?.tableColumns || []}
          locale={locale}
        />
      ) : (
        <SubmissionItem answers={answers} locale={locale} />
      )}

      {total > 10 && (
        <Pagination
          className="heyform-report-pagination"
          total={total}
          page={page}
          pageSize={10}
          buttonProps={{
            size: 'sm'
          }}
          loading={loading}
          onChange={handleChange}
        />
      )}
    </div>
  )
}
