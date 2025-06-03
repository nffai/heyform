import { flattenFields } from '@heyform-inc/answer-utils'
import { UNSELECTABLE_FIELD_KINDS } from '@heyform-inc/shared-types-enums'
import { NextApiRequest } from 'next'
import { ImageResponse } from 'next/og'
import { JSX } from 'react'

import { FormService } from '@/service/form'

export const config = {
  runtime: 'edge'
}

let interMediumData: ArrayBuffer | null = null
let interBoldData: ArrayBuffer | null = null
let ogData: ArrayBuffer | null = null
let bgData: ArrayBuffer | null = null

export default async function handler(req: NextApiRequest) {
  try {
    const formId = new URL(req.url).searchParams.get('formId') as string

    if (!interMediumData) {
      interMediumData = await fetch(
        new URL('../../../../assets/Inter-Medium.ttf', import.meta.url)
      ).then(res => res.arrayBuffer())
    }

    if (!interBoldData) {
      interBoldData = await fetch(
        new URL('../../../../assets/Inter-Bold.ttf', import.meta.url)
      ).then(res => res.arrayBuffer())
    }

    if (!ogData) {
      ogData = await fetch(new URL('../../../../assets/og-image.png', import.meta.url)).then(res =>
        res.arrayBuffer()
      )
    }

    if (!bgData) {
      bgData = await fetch(new URL('../../../../assets/og-bg.png', import.meta.url)).then(res =>
        res.arrayBuffer()
      )
    }

    const { form } = await FormService.publicForm(formId)

    let children: JSX.Element

    if (!form.suspended && form.settings?.active) {
      const fieldsCount = flattenFields(form.fields).filter(
        f => !UNSELECTABLE_FIELD_KINDS.includes(f.kind)
      ).length

      let meta = fieldsCount <= 1 ? `1 question` : `${fieldsCount} questions`

      const timeToComplete = Math.round(1.2 * (Math.log(fieldsCount) / Math.log(2)))
      const unit = !isNaN(timeToComplete) && timeToComplete > 1 ? 'mins' : 'min'

      meta += `, ${timeToComplete} ${unit} to complete`

      children = (
        <div tw="flex flex-col w-full h-full bg-white items-start justify-center">
          <img tw="w-full h-full" src={bgData} />

          <div tw="absolute inset-0 flex flex-col">
            <div tw="flex">
              <div tw="mt-[77px] h-[88px] mx-[89px] border border-[rgba(15,23,42,0.3)] rounded-[20px] px-[78px] leading-[88px] font-medium text-[32px]">
                {meta}
              </div>
            </div>
            <div tw="flex items-center h-[320px] mx-[89px]">
              <div
                tw="font-bold text-[68px] leading-[80px]"
                style={{
                  display: 'block',
                  lineClamp: 2
                }}
              >
                {form.name}
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      children = (
        <div tw="flex flex-col w-full h-full bg-white items-start justify-center">
          <img tw="w-full h-full" src={ogData} />
        </div>
      )
    }

    return new ImageResponse(children, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: interMediumData,
          style: 'normal',
          weight: 500
        },
        {
          name: 'Inter',
          data: interBoldData,
          style: 'normal',
          weight: 700
        }
      ]
    })
  } catch (err: Any) {
    console.error(err)

    return new Response(`Failed to generate the image`, {
      status: 500
    })
  }
}
