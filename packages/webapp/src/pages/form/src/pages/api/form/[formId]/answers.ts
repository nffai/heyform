import { toInt } from '@heyform-inc/utils'
import { Request, Response } from 'express'

import { FormService } from '@/service/form'

export default async function handler(req: Request, res: Response): Promise<void> {
  if (req.method === 'GET') {
    try {
      const { formId, fieldId, page } = req.query

      res
        .status(200)
        .json(await FormService.answers(formId as string, fieldId as string, toInt(page, 1)))
    } catch (err) {
      res.status(500).json({
        error: err.message
      })
    }
  }
}
