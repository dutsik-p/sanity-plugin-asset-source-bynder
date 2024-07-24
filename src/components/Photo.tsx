import {Text} from '@sanity/ui'
import {useCallback, useEffect} from 'react'

import type {BynderPhoto} from '../types'
import {CreditLine, CreditLineLink, Root} from './Photo.styled'

type Props = {
  data: BynderPhoto
  thumbnailPropName: string
  width: number
  height: number
  onClick: (photo: BynderPhoto) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onKeyDown: (event: any) => void
  active: boolean
  onFocus: (photo: BynderPhoto) => void
}

const UTM_SOURCE = 'sanity-plugin-asset-source-bynder'

export default function Photo(props: Props) {
  const {onClick, data, onKeyDown, onFocus, active, width, height} = props
  const handleClick = useCallback(() => {
    onClick(data)
  }, [onClick, data])

  const handleCreditLineClicked = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      event.stopPropagation()
      //https://ticinoturismo.getbynder.com/media/?mediaId=9680B719-79F8-4571-9DDB968CCD102F64
      const url = `${data.transformBaseUrl}?utm_source=${encodeURIComponent(
        UTM_SOURCE,
      )}&utm_medium=referral`
      window.open(url, data.id, 'noreferrer,noopener')
    },
    [data],
  )

  const handleKeyDown = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      onKeyDown(event)
      if (event.keyCode === 13) {
        onClick(data)
      }
    },
    [onKeyDown, data, onClick],
  )

  const handleMouseDown = useCallback(() => {
    onFocus(data)
  }, [onFocus, data])

  useEffect(() => {
    if (active) {
      onFocus(data)
    }
  }, [active, data, onFocus])

  const src = data.thumbnails[props.thumbnailPropName]

  const userName = data.userCreated

  return (
    <Root
      title={`Select image by ${userName}
              from Bynder`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: `url("${src}")`,
      }}
      onClick={handleClick}
    >
      <CreditLineLink onClick={handleCreditLineClicked}>
        <CreditLine padding={2} radius={2} margin={2}>
          <Text size={1} title={`Open image by ${userName} on Bynder in new window`}>
            By @{data.userCreated}
          </Text>
        </CreditLine>
      </CreditLineLink>
    </Root>
  )
}
