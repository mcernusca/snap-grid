import React, { useRef } from 'react'
import styled from 'styled-components'
import { useGesture } from 'react-with-gesture'

export const useResizeHandles = function(onResize) {
  // This hook could inject up to 8 different drag handlers,
  // only implemented bottom right corner here.
  // Note:
  // Right side handles only change size,
  // Left side handles also change origin and size (top left pivot)

  const bindBottomRight = useGesture(
    ({ event, args, first, down, xy, initial }) => {
      if (first) {
        event.preventDefault()
        event.stopPropagation()
      }

      const xDelta = xy[0] - initial[0]
      const yDelta = xy[1] - initial[1]

      onResize({
        args: args,
        first: first,
        down: down,
        originDelta: [0, 0],
        sizeDelta: [xDelta, yDelta]
      })
    }
  )

  // We return a factory function instead of the component itself
  // in order to capture a unique identifier that is passed along to the
  // resize callback. This is only important if we share a callback between
  // multiple components.
  const [factory] = React.useState(() => {
    return args => {
      return <BottomRightHandle {...bindBottomRight(args)} />
    }
  })
  return factory
}

const Handle = styled.div`
  position: absolute;
  pointer-events: auto;
`

const CornerHandle = styled(Handle)`
  position: absolute;
  width: 20px;
  height: 20px;
`
const BottomRightHandle = styled(CornerHandle)`
  bottom: 0;
  right: 0;
  cursor: nwse-resize;

  background: darkblue;
  border: 4px solid rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 150ms ease-out;
  &:hover {
    opacity: 1;
  }
`
