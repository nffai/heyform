import { initI18n } from '@heyform-inc/form-renderer/src'

import { CustomHead } from '../../components/CustomHead'
import { Renderer } from '../../components/Renderer'

// Init i18n for form render
initI18n()

// @heyform/answer-utils validatePayment
process.env.VALIDATE_CLIENT_SIDE = String(true)

export interface FormPageProps extends PublicFormType {
  query: Record<string, Any>
  locale: string
}

export default function Index({ team, form, integrations, query, locale }: FormPageProps) {
  return (
    <>
      {form && <CustomHead team={team} form={form} query={query} integrations={integrations} />}
      {form && <Renderer form={form} query={query} locale={locale} />}
    </>
  )
}
