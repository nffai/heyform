export {}

declare global {
  import { AnalyticIntegrationEnums } from './consts'
  import { FormModel } from '@heyform-inc/shared-types-enums'

  export type Any = Any

  export interface PublicFormType {
    team: { avatar?: string }
    form: FormModel
    integrations: Record<AnalyticIntegrationEnums, string>
    query?: Record<string, Any>
  }

  export interface AnalyticProps {
    apiKey: string
  }

  interface Window {
    grecaptcha: Any
    initGeetest4: Any
    heyform: {
      device: {
        ios: boolean
        android: boolean
        mobile: boolean
        windowHeight: number
        screenHeight: number
      }
    }
  }
}
