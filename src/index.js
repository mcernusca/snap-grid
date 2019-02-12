import React from 'react'
import ReactDOM from 'react-dom'
import Grid from './grid'
import GridWindow from './grid-window'
import { Frame } from './models'
import { useImmerReducer } from 'use-immer'

import './styles.css'

const initialState = {
  frames: [
    Frame(9, 4, 6, 4),
    Frame(2, 9, 13, 16),
    Frame(16, 2, 4, 4),
    Frame(16, 7, 14, 9),
    Frame(16, 17, 10, 13)
  ]
}

function reducer(draft, action) {
  switch (action.type) {
    case 'resize':
    case 'move': {
      draft.frames[action.index] = {
        ...draft.frames[action.index],
        ...action.payload
      }
      break
    }
    default: {
      break
    }
  }
}

function App() {
  const [state, dispatch] = useImmerReducer(reducer, initialState)

  return (
    <Grid
      frame={Frame(50, 50, 512, 512)}
      rows={32}
      cols={32}
      dispatch={dispatch}
    >
      {state.frames.map((f, i) => (
        <GridWindow frame={f} key={i} />
      ))}
    </Grid>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
