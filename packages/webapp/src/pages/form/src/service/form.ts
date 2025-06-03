import { request } from '../utils/request'

export class FormService {
  static async publicForm(formId: string): Promise<PublicFormType> {
    return request<PublicFormType>(`/${formId}`)
  }

  static async report(formId: string): Promise<Any> {
    return request<Any>(`/${formId}/report`)
  }

  static async answers(
    formId: string,
    fieldId: string,
    page = 1
  ): Promise<{ total: number; answers: Any[] }> {
    return request<{ total: number; answers: Any[] }>(`/${formId}/answers`, {
      fieldId,
      page
    })
  }
}
