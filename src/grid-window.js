import React from 'react'
import styled from 'styled-components'

export default function GridWindow() {
  return <Container className="grid-window" />
}

const Container = styled.div`
  position: absolute;
  background: #fffcdc;
  overflow: hidden;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  box-shadow: 0px 2px 2px 0 rgba(0, 0, 0, 0.2);
`
