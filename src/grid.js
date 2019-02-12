import React from 'react'
import styled from 'styled-components'
import { useGesture } from 'react-with-gesture'
import { useSprings, animated } from 'react-spring'
import {
  gridFrameToPxFrame,
  gridSizeForContainerSize,
  snapToGrid,
  cap,
  zipMap,
  pxToGrid
} from './utils'
import cx from 'classnames'
import { useResizeHandles } from './resize-handles.js'
import { useEventCallback } from './use-event-callback'

const SPRING_CONFIG = { friction: 50, tension: 500 }

export default function Grid({ frame, rows, cols, children, dispatch }) {
  const [isDragging, setIsDragging] = React.useState(false)
  const cellSize = gridSizeForContainerSize(frame.size, rows, cols)
  const childrenArr = React.Children.toArray(children)

  const [animProps, set] = useSprings(childrenArr.length, index => {
    const child = childrenArr[index]
    const childFrame = gridFrameToPxFrame(child.props.frame, cellSize)
    return {
      origin: childFrame.origin,
      originSnap: childFrame.origin,
      size: childFrame.size,
      sizeSnap: childFrame.size,
      config: SPRING_CONFIG
    }
  })

  const bindDragHandlers = useGesture(
    useEventCallback(
      ({ args: [index], event, first, delta: [xDelta, yDelta], down }) => {
        if (first) {
          event.preventDefault()
        }

        if (first) setIsDragging(true)
        if (!down) setIsDragging(false)

        const child = childrenArr[index]
        const childFrame = gridFrameToPxFrame(child.props.frame, cellSize)

        const _origin = [
          cap(
            childFrame.origin[0] + xDelta,
            0,
            frame.size[0] - childFrame.size[0]
          ),
          cap(
            childFrame.origin[1] + yDelta,
            0,
            frame.size[1] - childFrame.size[1]
          )
        ]
        const _originSnap = zipMap(snapToGrid, _origin, cellSize)

        set(
          i =>
            index === i && {
              immediate: down,
              origin: down ? _origin : _originSnap,
              originSnap: _originSnap
            }
        )

        if (!down && (xDelta || yDelta)) {
          dispatch({
            type: 'move',
            index: index,
            payload: {
              origin: zipMap(pxToGrid, _originSnap, cellSize)
            }
          })
        }
      }
    )
  )

  const buildResizeHandles = useResizeHandles(
    useEventCallback(
      ({ args: [index], first, down, sizeDelta: [wDelta, hDelta] }) => {
        if (first) setIsDragging(true)
        if (!down) setIsDragging(false)

        const child = childrenArr[index]
        const {
          size: [w, h],
          origin: [x, y]
        } = gridFrameToPxFrame(child.props.frame, cellSize)

        const _origin = [w + wDelta, h + hDelta]
        const _size = zipMap(cap, _origin, cellSize, [
          frame.size[0] - x,
          frame.size[1] - y
        ])
        const _sizeSnap = zipMap(snapToGrid, _size, cellSize)

        set(
          i =>
            index === i && {
              immediate: down,
              size: down ? _size : _sizeSnap,
              sizeSnap: _sizeSnap
            }
        )

        if (!down) {
          dispatch({
            type: 'resize',
            index: index,
            payload: {
              size: zipMap(pxToGrid, _sizeSnap, cellSize)
            }
          })
        }
      }
    )
  )

  const canvasClasses = cx({
    'grid-canvas': true,
    'is-dragging': isDragging
  })

  return (
    <Canvas className={canvasClasses} frame={frame} cellSize={cellSize}>
      <RelativeWrapper>
        {React.Children.map(children, (child, i) => {
          const animChildProps = animProps[i]
          return (
            <>
              <StickyShadow
                className="grid-shadow"
                style={{
                  ...interpolateStyles(
                    animChildProps.sizeSnap,
                    animChildProps.originSnap
                  )
                }}
              />
              <animated.div
                {...bindDragHandlers(i)}
                className="grid-item"
                style={{
                  position: 'absolute',
                  ...interpolateStyles(
                    animChildProps.size,
                    animChildProps.origin
                  )
                }}
              >
                {child}
                {buildResizeHandles(i)}
              </animated.div>
            </>
          )
        })}
      </RelativeWrapper>
    </Canvas>
  )
}

const interpolateStyles = function(animSize, animOrigin) {
  return {
    width: animSize.interpolate((w, _) => `${w}px`),
    height: animSize.interpolate((_, h) => `${h}px`),
    transform: animOrigin.interpolate((x, y) => `translate3d(${x}px,${y}px,0)`)
  }
}

const Canvas = styled.div`
  position: absolute;
  top: ${props => props.frame.origin[0]}px;
  left: ${props => props.frame.origin[1]}px;
  width: ${props => props.frame.size[0]}px;
  height: ${props => props.frame.size[1]}px;

  background: #e4edf4;
  border-radius: 20px;

  &.is-dragging {
    background-size: ${props => props.cellSize[0]}px ${props =>
  props.cellSize[1]}px
    background-image: linear-gradient(
        to right,
        rgba(84, 84, 84, 0.2) 1px,
        transparent 1px
      ),
      linear-gradient(to bottom, rgba(84, 84, 84, 0.2) 1px, transparent 1px);
  }
`
const RelativeWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`
const StickyShadow = styled(animated.div)`
  position: absolute;
  background: rgba(84, 84, 84, 0.2);
  will-change: transform, width, height;
  pointer-events: none;
`
