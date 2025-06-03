import { flattenFields, htmlUtils } from '@heyform-inc/answer-utils'
import { SuspendedMessage, initI18n, useTranslation } from '@heyform-inc/form-renderer/src'
import {
  CHOICES_FIELD_KINDS,
  FieldKindEnum,
  QUESTION_FIELD_KINDS
} from '@heyform-inc/shared-types-enums'
import { helper, pickValidValues } from '@heyform-inc/utils'
import type { GetServerSidePropsContext } from 'next'
import { Trans } from 'react-i18next'

import { ReportHead } from '@/components/CustomHead'
import { LogoIcon } from '@/components/LogoIcon'
import { ReportBackground } from '@/components/ReportBackground'
import { ReportList } from '@/components/ReportList'
import { FormService } from '@/service/form'
import { getPreferredLanguage } from '@/utils/brower-language'

// Init i18n for ssr
initI18n()

export default function Report({ form, responses, theme, locale, active }: Record<string, Any>) {
  const { t } = useTranslation()

  return (
    <>
      <ReportHead form={form} theme={theme} active={active} />

      {active ? (
        <>
          {theme?.backgroundImage && (
            <ReportBackground
              backgroundImage={theme.backgroundImage}
              brightness={theme.brightness}
            />
          )}
          <div className="heyform-report">
            <ReportList form={form} responses={responses} locale={locale} />

            {!form.removeBranding && (
              <a
                className="heyform-branding fixed bottom-4 right-4 bg-[var(--heyform-report-question)] text-[var(--heyform-report-button-text)]"
                href="https://heyform.net/?ref=badge"
                target="_blank"
                rel="noreferrer"
              >
                <Trans
                  key="Made with HeyForm"
                  t={t}
                  i18nKey="Made with HeyForm"
                  components={{
                    icon: <LogoIcon className="inline h-4 w-4" />,
                    span: <span className="font-bold" />
                  }}
                />
              </a>
            )}
          </div>
        </>
      ) : (
        <SuspendedMessage />
      )}
    </>
  )
}

const LANGUAGES = ['en', 'de', 'fr', 'pl', 'ja', 'zh-cn', 'zh-tw']

export async function getServerSideProps({ req, params }: GetServerSidePropsContext): Promise<Any> {
  const { form, responses, submissions, hiddenFields, theme, active } = await FormService.report(
    (params.id || params.formId) as string
  )

  const locale = getPreferredLanguage(req, {
    languages: LANGUAGES,
    fallback: LANGUAGES[0]
  })

  const fields = flattenFields(form.fields).filter(
    field => QUESTION_FIELD_KINDS.includes(field.kind) && !hiddenFields.includes(field.id)
  )

  let _responses: Any[] = []

  if (helper.isValidArray(fields)) {
    const choiceKinds = [FieldKindEnum.YES_NO, ...CHOICES_FIELD_KINDS]

    _responses = fields!.map(field => {
      let row = responses.find((row: Any) => row.id === field.id)

      if (row) {
        row.answers = submissions.data.find((row: Any) => row._id === field.id)?.answers || []

        if (choiceKinds.includes(field.kind)) {
          row.chooses = field.properties?.choices?.map(choice => {
            const choose = row.chooses.find((row: Any) => row.id === choice.id)

            return {
              ...choose,
              ...choice
            }
          })
        }

        if (helper.isEmpty(row.chooses)) {
          row.chooses = []
        }
      } else {
        row = {
          id: field.id,
          chooses: [],
          total: 0,
          count: 0,
          average: 0
        }
      }

      row.title = helper.isArray(field.title)
        ? htmlUtils.plain(htmlUtils.serialize(field.title as Any))
        : field.title
      row.kind = field.kind
      row.properties = pickValidValues((field.properties as Any) || {}, [
        'tableColumns',
        'total',
        'average',
        'leftLabel',
        'rightLabel'
      ])

      return row
    })
  }

  return {
    props: {
      form: {
        ...form,
        submissions: submissions.total
      },
      responses: _responses,
      theme,
      locale,
      active
    }
  }
}
