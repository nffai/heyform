import { initI18n } from '@heyform-inc/form-renderer/src'

import FormPage from '../..'

// Init i18n for form render
initI18n()

// @heyform/answer-utils validatePayment
process.env.VALIDATE_CLIENT_SIDE = String(true)

export default FormPage
