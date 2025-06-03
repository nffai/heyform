import { toURLQuery } from '@heyform-inc/utils'

export async function request<T>(url: string, query?: Any): Promise<T> {
  const options: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic cm9vdDo2NjY='
    },
    redirect: 'follow'
  }

  const r = await fetch(
    toURLQuery(query, process.env.FORM_DETAIL_API_URI.replace(/\/+$/, '') + url),
    options
  )
  const result = await r.json()

  return result as T
}
