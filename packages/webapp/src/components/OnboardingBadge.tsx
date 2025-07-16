import { useLocalStorageState } from 'ahooks'
import { FC, useCallback, useMemo } from 'react'

import { cn } from '@/utils'
import { helper } from '@heyform-inc/utils'

import { ONBOARDING_STORAGE_KEY } from '@/consts'

interface DotBadgeProps extends ComponentProps {
  name: string
  precondition?: string
}

export function useOnboardingStorage() {
  const [state, setState] = useLocalStorageState<Any>(ONBOARDING_STORAGE_KEY, {
    defaultValue: {},
    listenStorageChange: true
  })

  const setItem = useCallback(
    (name: string, value: Any) => {
      setState((s: Any) => ({ ...s, [name]: value }))
    },
    [setState]
  )

  return {
    state,
    setItem
  }
}

export const OnboardingBadge: FC<DotBadgeProps> = ({ className, name, precondition }) => {
  const { state } = useOnboardingStorage()

  const isCompleted = useMemo(() => {
    const value = helper.isTrue(state[name])

    if (precondition) {
      return helper.isTrue(state[precondition]) ? value : true
    }

    return value
  }, [name, precondition, state])

  if (isCompleted) {
    return null
  }

  return (
    <div
      className={cn(
        'pointer-events-none absolute right-0.5 top-0.5 flex items-center justify-center',
        className
      )}
    >
      <span className="absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5 h-3 w-3 origin-center animate-ping rounded-full border border-blue-600 bg-blue-600/50"></span>
      <span className="relative h-2 w-2 rounded-full bg-blue-600"></span>
    </div>
  )
}
