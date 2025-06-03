import { helper } from '@heyform-inc/utils'
import { FC, useMemo } from 'react'

interface ReportBackgroundProps {
  backgroundImage?: string
  brightness?: number
}

function getBrightnessStyle(brightness: number) {
  const value = 1 + brightness / 100

  if (value < 0) {
    return {
      filter: `brightness(${value})`
    }
  }

  return {
    filter: `contrast(${2 - value}) brightness(${value})`
  }
}

export const ReportBackground: FC<ReportBackgroundProps> = ({
  backgroundImage,
  brightness = 0
}) => {
  const isImage = useMemo(() => helper.isURL(backgroundImage), [backgroundImage])

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {isImage ? (
        <img
          className="h-full w-full object-cover"
          src={backgroundImage}
          style={getBrightnessStyle(brightness)}
          alt="HeyForm report background"
        />
      ) : (
        <div
          className="h-full w-full"
          style={{
            backgroundImage,
            ...getBrightnessStyle(brightness)
          }}
        />
      )}
    </div>
  )
}
