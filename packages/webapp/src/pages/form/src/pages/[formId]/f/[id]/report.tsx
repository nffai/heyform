import { initI18n } from '@heyform-inc/form-renderer/src'

import ReportPage from '@/pages/[formId]/report'

// Init i18n for form render
initI18n()

// @heyform/answer-utils validatePayment
process.env.VALIDATE_CLIENT_SIDE = String(true)

export default ReportPage
export { getServerSideProps } from '@/pages/[formId]/report'
