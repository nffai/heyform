import { FormRenderer, sendMessageToParent } from '@heyform-inc/form-renderer/src'
import {
  CaptchaKindEnum,
  FieldKindEnum,
  FormModel,
  HiddenFieldAnswer
} from '@heyform-inc/shared-types-enums'
import { helper } from '@heyform-inc/utils'
import { FC, useEffect, useRef, useState } from 'react'

import { EndpointService } from '../service/endpoint'
import { geeTestToken, initGeeTest, recaptchaToken } from '../utils/captcha'
import { Uploader } from '../utils/uploader'
import { PasswordCheck } from './PasswordCheck'

interface RendererProps {
  form: FormModel
  query: Record<string, Any>
  locale: string
  contactId?: string
}

let captchaRef: Any = null

export const Renderer: FC<RendererProps> = ({ form, query, locale, contactId }) => {
  const openTokenRef = useRef<string | undefined>(undefined)
  const passwordTokenRef = useRef<string | undefined>(undefined)
  const [isPasswordChecked, setIsPasswordChecked] = useState(false)

  async function openForm() {
    sendMessageToParent('FORM_OPENED')
    openTokenRef.current = await EndpointService.openForm(form.id)
  }

  function handlePasswordFinish(passwordToken: string) {
    passwordTokenRef.current = passwordToken
    setIsPasswordChecked(true)
  }

  async function handleSubmit(values: Any, partialSubmission?: boolean, stripe?: Any) {
    try {
      let token: Record<string, Any> = {}

      switch (form.settings?.captchaKind) {
        case CaptchaKindEnum.GOOGLE_RECAPTCHA:
          token.recaptchaToken = await recaptchaToken(captchaRef)
          break

        case CaptchaKindEnum.GEETEST_CAPTCHA:
          captchaRef?.showCaptcha()
          token = await geeTestToken(captchaRef)
          break
      }

      const file = await new Uploader(form, values).start()

      const hiddenFields = (form!.hiddenFields || [])
        .map(field => {
          const value = query[field.name]

          if (helper.isValid(value)) {
            return {
              ...field,
              value
            }
          }
        })
        .filter(Boolean) as HiddenFieldAnswer[]

      const { clientSecret } = await EndpointService.completeSubmission({
        formId: form.id,
        contactId,
        answers: {
          ...values,
          ...file
        },
        hiddenFields,
        openToken: openTokenRef.current,
        passwordToken: passwordTokenRef.current,
        partialSubmission,
        ...(token || {})
      })

      if (stripe && helper.isValid(clientSecret)) {
        const paymentField = form.fields.find(f => f.kind === FieldKindEnum.PAYMENT)

        if (paymentField) {
          const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: stripe.elements.getElement('cardNumber'),
              billing_details: values[paymentField.id]?.billingDetails
            }
          })

          if (result.error) {
            throw new Error(result.error.message)
          }
        }
      }

      sendMessageToParent('FORM_SUBMITTED')
    } catch (err: Any) {
      // Reset GeeTest captcha
      captchaRef?.reset()

      /**
       * Throw error to let Renderer knows that there was an error.
       * If we don't do this, the form will be show as submitted
       */
      throw err
    }
  }

  async function initCaptcha() {
    switch (form.settings?.captchaKind) {
      case CaptchaKindEnum.GEETEST_CAPTCHA:
        captchaRef = await initGeeTest()
        break

      case CaptchaKindEnum.GOOGLE_RECAPTCHA:
        captchaRef = window.grecaptcha
        break
    }
  }

  useEffect(() => {
    sendMessageToParent('FORM_LOADED')

    if (!form.suspended && form.settings.active) {
      openForm()
      initCaptcha()
    }
  }, [])

  if (form.settings?.requirePassword && !isPasswordChecked) {
    return <PasswordCheck form={form} onFinish={handlePasswordFinish} />
  }

  return (
    <>
      <FormRenderer
        form={form as Any}
        query={query}
        locale={locale}
        stripeApiKey={(form as Any).stripe?.publishableKey}
        stripeAccountId={(form as Any).stripe?.accountId}
        autoSave={!(form.settings?.enableTimeLimit && helper.isValid(form.settings?.timeLimit))}
        alwaysShowNextButton={true}
        customUrlRedirects={(form.settings as Any)?.customUrlRedirects}
        enableQuestionList={form.settings?.enableQuestionList}
        enableNavigationArrows={form.settings?.enableNavigationArrows}
        reportAbuseURL={'https://docs.heyform.net/legal/report-abuse#report-abuse'}
        ssr={true}
        onSubmit={handleSubmit}
      />

      {/* Custom css */}
      {helper.isValid(form.themeSettings?.theme?.customCSS) && (
        <style dangerouslySetInnerHTML={{ __html: form.themeSettings!.theme!.customCSS }} />
      )}
    </>
  )
}
