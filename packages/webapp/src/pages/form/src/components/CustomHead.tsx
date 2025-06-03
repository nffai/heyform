import { getTheme, getThemeStyle, getWebFontURL } from '@heyform-inc/form-renderer/src'
import { CaptchaKindEnum } from '@heyform-inc/shared-types-enums'
import { alpha, darken, helper, isDarkColor, lighten, toURLQuery } from '@heyform-inc/utils'
import { useEffect } from 'react'

import { RECAPTCHA_KEY } from '../consts'
import { isStripeEnabled } from '../utils/payment'

const APP_NAME = 'HeyForm'
const APP_DESCRIPTION =
  'Build elegant, clean customized forms according to your requirements. Easy to build drag and drop form buider. Create online forms with event feedback form template, exam registration form template, customer satisfaction survey template, event feedback form template, and more.'

const APP_FAVICON_URL = 'https://forms.b-cdn.net/website/favicon.png'

const GoogleAnalytics = ({ apiKey }: AnalyticProps) => {
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${apiKey}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${apiKey}');`
        }}
      />
    </>
  )
}

const FacebookPixel = ({ apiKey }: AnalyticProps) => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${apiKey}');
            fbq('track', 'PageView');`
      }}
    />
  )
}

interface ReportHeadProps {
  form: Record<string, Any>
  theme: Record<string, Any>
  active: boolean
}

function getStyle(theme: Record<string, Any>, active: boolean) {
  if (!active) {
    return
  }

  return `
    body {
      font-family: ${theme.fontFamily};
      --heyform-report-background-color: ${theme.backgroundColor};
      --heyform-report-heading: ${theme.heading};
      --heyform-report-heading-a60: ${alpha(theme.heading, 0.6)};
      --heyform-report-question: ${theme.question};
      --heyform-report-question-a60: ${alpha(theme.question, 0.6)};
      --heyform-report-question-a05: ${alpha(theme.question, 0.05)};
      --heyform-report-chart: ${theme.chart};
      --heyform-report-chart-a15: ${alpha(theme.chart, 0.15)};
      --heyform-report-chart-a025: ${alpha(theme.chart, 0.025)};
      --heyform-report-button-text: ${isDarkColor(theme.question) ? lighten(theme.question, 1) : darken(theme.question, 1)};
    }

    html, body, #__next {
      height: auto !important;
      overflow: auto !important;
    }
  `
}

export function ReportHead({ form, theme, active }: ReportHeadProps) {
  const fontURL = getWebFontURL(theme.fontFamily)
  const publicUrl = `${process.env.NEXT_PUBLIC_FORM_PREFIX}/${form.id}/report`

  let title = APP_NAME
  let description = APP_DESCRIPTION
  let faviconUrl = APP_FAVICON_URL
  let ogImageUrl = `${process.env.NEXT_PUBLIC_FORM_PREFIX}/api/og/${form.id}?v=${form.version || 0}`

  if (active) {
    title = form.name

    if (helper.isValid(form.metaDescription)) {
      description = form.metaDescription
    }

    if (form.logo) {
      faviconUrl = toURLQuery(
        {
          url: form.logo,
          w: 32,
          h: 32,
          format: 'png'
        },
        process.env.NEXT_PUBLIC_IMAGE_RESIZE_URL
      )
    }

    if (form.metaOGImageUrl) {
      ogImageUrl = form.metaOGImageUrl
    }
  }

  useEffect(() => {
    // Set document title
    document.title = title

    // Create or update meta tags
    const setMeta = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let meta = document.querySelector(selector) as HTMLMetaElement
      if (!meta) {
        meta = document.createElement('meta')
        if (property) {
          meta.setAttribute('property', name)
        } else {
          meta.setAttribute('name', name)
        }
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Set meta tags
    setMeta('description', description)
    setMeta('og:url', publicUrl, true)
    setMeta('og:type', 'website', true)
    setMeta('og:title', title, true)
    setMeta('og:description', description, true)
    setMeta('og:image', ogImageUrl, true)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title, true)
    setMeta('twitter:description', description, true)
    setMeta('twitter:image', ogImageUrl, true)

    // Add font link
    let fontLink = document.querySelector(`link[href="${fontURL}"]`) as HTMLLinkElement
    if (!fontLink) {
      fontLink = document.createElement('link')
      fontLink.href = fontURL
      fontLink.rel = 'stylesheet'
      document.head.appendChild(fontLink)
    }

    // Add favicon
    let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (!faviconLink) {
      faviconLink = document.createElement('link')
      faviconLink.rel = 'icon'
      faviconLink.setAttribute('sizes', '32x32')
      faviconLink.type = 'image/png'
      document.head.appendChild(faviconLink)
    }
    faviconLink.href = faviconUrl

    // Add custom styles
    let styleElement = document.querySelector('#heyform-report-styles') as HTMLStyleElement
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'heyform-report-styles'
      document.head.appendChild(styleElement)
    }
    styleElement.innerHTML = getStyle(theme, active) || ''
  }, [title, description, publicUrl, ogImageUrl, fontURL, theme, active])

  return null
}

export function CustomHead({ team, form, integrations, query }: PublicFormType) {
  const theme = getTheme(form.themeSettings?.theme)
  const fontURL = getWebFontURL(theme.fontFamily)
  const publicUrl = `${process.env.NEXT_PUBLIC_FORM_PREFIX}/${form.id}`

  let title = APP_NAME
  let description = APP_DESCRIPTION
  let faviconUrl = APP_FAVICON_URL
  let ogImageUrl = `${process.env.NEXT_PUBLIC_FORM_PREFIX}/api/og/${form.id}?v=${form.version || 0}`

  if (form.settings.active) {
    if (helper.isValid(form.settings?.metaTitle)) {
      title = form.settings.metaTitle
    } else {
      title = helper.isValid(form.name) ? form.name : APP_NAME
    }

    if (helper.isValid(form.settings?.metaDescription)) {
      description = form.settings.metaDescription
    }

    if (team?.avatar) {
      faviconUrl = toURLQuery(
        {
          url: team.avatar,
          w: 32,
          h: 32,
          format: 'png'
        },
        process.env.NEXT_PUBLIC_IMAGE_RESIZE_URL
      )
    }

    if (form.settings?.metaOGImageUrl) {
      ogImageUrl = form.settings.metaOGImageUrl
    }
  }

  useEffect(() => {
    // Set document title
    document.title = title

    // Create or update meta tags
    const setMeta = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let meta = document.querySelector(selector) as HTMLMetaElement
      if (!meta) {
        meta = document.createElement('meta')
        if (property) {
          meta.setAttribute('property', name)
        } else {
          meta.setAttribute('name', name)
        }
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Set meta tags
    setMeta('description', description)
    setMeta('og:url', publicUrl, true)
    setMeta('og:type', 'website', true)
    setMeta('og:title', title, true)
    setMeta('og:description', description, true)
    setMeta('og:image', ogImageUrl, true)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title, true)
    setMeta('twitter:description', description, true)
    setMeta('twitter:image', ogImageUrl, true)

    // Add font link
    let fontLink = document.querySelector(`link[href="${fontURL}"]`) as HTMLLinkElement
    if (!fontLink) {
      fontLink = document.createElement('link')
      fontLink.href = fontURL
      fontLink.rel = 'stylesheet'
      document.head.appendChild(fontLink)
    }

    // Add favicon
    let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (!faviconLink) {
      faviconLink = document.createElement('link')
      faviconLink.rel = 'icon'
      faviconLink.setAttribute('sizes', '32x32')
      faviconLink.type = 'image/png'
      document.head.appendChild(faviconLink)
    }
    faviconLink.href = faviconUrl

    // Add custom styles
    let styleElement = document.querySelector('#heyform-custom-styles') as HTMLStyleElement
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'heyform-custom-styles'
      document.head.appendChild(styleElement)
    }
    styleElement.innerHTML = getThemeStyle(theme, query) || ''

    // Add scripts conditionally
    if (form.settings.captchaKind === CaptchaKindEnum.GOOGLE_RECAPTCHA) {
      let recaptchaScript = document.querySelector('#google-recaptcha-script') as HTMLScriptElement
      if (!recaptchaScript) {
        recaptchaScript = document.createElement('script')
        recaptchaScript.id = 'google-recaptcha-script'
        recaptchaScript.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_KEY}`
        document.head.appendChild(recaptchaScript)
      }
    }

    if (form.settings.captchaKind === CaptchaKindEnum.GEETEST_CAPTCHA) {
      let geetestScript = document.querySelector('#geetest-script') as HTMLScriptElement
      if (!geetestScript) {
        geetestScript = document.createElement('script')
        geetestScript.id = 'geetest-script'
        geetestScript.src = 'https://static.geetest.com/v4/gt4.js'
        document.head.appendChild(geetestScript)
      }
    }

    if (isStripeEnabled(form)) {
      let stripeScript = document.querySelector('#stripe') as HTMLScriptElement
      if (!stripeScript) {
        stripeScript = document.createElement('script')
        stripeScript.id = 'stripe'
        stripeScript.src = 'https://js.stripe.com/v3/'
        document.head.appendChild(stripeScript)
      }
    }
  }, [
    title,
    description,
    publicUrl,
    ogImageUrl,
    fontURL,
    theme,
    query,
    form.settings,
    integrations
  ])

  return (
    <>
      {helper.isValid(integrations.googleanalytics) && (
        <GoogleAnalytics apiKey={integrations.googleanalytics} />
      )}
      {helper.isValid(integrations.facebookpixel) && (
        <FacebookPixel apiKey={integrations.facebookpixel} />
      )}
    </>
  )
}
