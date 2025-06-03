import { parseAcceptLanguage } from 'intl-parse-accept-language'

function getBrowserLanguage(req: Any) {
  const languages = parseAcceptLanguage(req.headers['accept-language'])

  return languages[0]
}

function normalizeCode(code?: string) {
  return code?.toLowerCase().replace(/_/g, '-')
}

interface GetPreferredLanguageOptions {
  languages: string[]
  fallback: string
}

export function getPreferredLanguage(
  req: Any,
  { languages, fallback }: GetPreferredLanguageOptions
) {
  const browserLanguage = normalizeCode(getBrowserLanguage(req))

  if (!browserLanguage) {
    return fallback
  }

  const lang = languages.find(lang => {
    const code = normalizeCode(lang)!

    return (
      code === browserLanguage ||
      browserLanguage.startsWith(code) ||
      code.startsWith(browserLanguage)
    )
  })

  return lang || fallback
}
