import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"

const enum gameStatuses { 
  loading = "loading",
  playing = "playing",
  win = "win",
}

const enum tileTypes {
  empty = 0,
  floor = 1,
  wall = 2,
}

type Level = {
  tilemap: Tilemap,
  cellsPerRow: number,
  playerPosition: Position,
  goalPosition: Position,
}

type Position = {
  x: number,
  y: number,
}

type Tilemap = number[]

type State = {
  levelIndex: number,
  gameStatus: gameStatuses,
  position: Position,
  margin: {
    left: number,
    top: number,
  },
}

const getCellValue = (level:Level, position:Position) => {
  return level.tilemap[position.y * level.cellsPerRow + position.x]
}

const getNextPosition = (level:Level, position:Position):Position|null => {
  if (getCellValue(level, position) !== tileTypes.floor) {
    return null
  }

  return position
}

const levels:Level[] = [
  {
    tilemap: [
      0, 2, 2, 2, 2, 2, 0,
      2, 2, 1, 2, 1, 2, 0,
      2, 1, 1, 1, 1, 2, 2,
      2, 2, 1, 1, 1, 1, 2,
      0, 2, 1, 1, 1, 2, 2,
      0, 2, 1, 1, 1, 2, 0,
      0, 2, 2, 2, 2, 2, 0,
    ],
    cellsPerRow: 7,
    playerPosition: {
      x: 3,
      y: 3,
    },
    goalPosition: {
      x: 2,
      y: 1,
    }
  },
  {
    tilemap: [
      0, 2, 2, 2, 2, 2, 0,
      2, 2, 1, 2, 1, 2, 0,
      2, 1, 1, 1, 1, 2, 2,
      2, 2, 1, 1, 1, 1, 2, 
      2, 1, 1, 1, 1, 2, 2, 
      2, 1, 1, 1, 1, 2, 0,
      2, 2, 2, 2, 2, 2, 0,
    ],
    cellsPerRow: 7,
    playerPosition: {
      x: 1,
      y: 4,
    },
    goalPosition: {
      x: 2,
      y: 1,
    }
  },
  {
    tilemap: [
      2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 2, 1, 1, 2,
      2, 1, 1, 1, 1, 2, 2,
      2, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 2, 2,
      2, 1, 1, 1, 1, 2, 0,
      2, 2, 2, 2, 2, 2, 0,
    ],
    cellsPerRow: 7,
    playerPosition: {
      x: 4,
      y: 2,
    },
    goalPosition: {
      x: 1,
      y: 1,
    }
  },
]

const cellSize = 50
const playerSize = 30

const getRows = (level:Level) => {
  return Math.ceil(level.tilemap.length / level.cellsPerRow)
}

const loadLevel = (index:number):State => {
  const level = levels[index]
  const state = {
    levelIndex: index,
    gameStatus: gameStatuses.playing,
    cellsPerRow: level.cellsPerRow,
    position: { ...level.playerPosition },
    margin: {
      left: 0,
      top: 0,
    },
  }
  const rows = getRows(level)
  const cols = level.cellsPerRow
  state.margin.left = (window.innerWidth - (rows * cellSize)) / 2
  state.margin.top = (window.innerHeight - (cols * cellSize)) / 2

  return state
}

const App = () => {
  const [state, setState] = useState<State>(loadLevel(0))
  const { margin, position } = state

  const level = levels[state.levelIndex]
  const rows = getRows(level)
  const cols = level.cellsPerRow

  const handleMove = (e:KeyboardEvent) => {
    if (state.gameStatus !== gameStatuses.playing) {
      return 
    }

    let newPosition = null

    if (e.key === "ArrowUp" || e.key === "w") {
      newPosition = getNextPosition(level, {
        ...position,
        y: Math.max(0, position.y - 1),
      })
    } else if (e.key === "ArrowLeft" || e.key === "a") {
      newPosition = getNextPosition(level, {
        ...position,
        x: Math.max(0, position.x - 1)
      })
    } else if (e.key === "ArrowDown" || e.key === "s") {
      newPosition = getNextPosition(level, {
        ...position,
        y: Math.min(rows - 1, position.y + 1),
      })
    } else if (e.key === "ArrowRight" || e.key === "d") {
      newPosition = getNextPosition(level, {
        ...position,
        x: Math.min(cols - 1, position.x + 1),
      })
    }


    if (newPosition) {
      let newState = {
        ...state,
        position: newPosition
      }

      if (
        newPosition.x === level.goalPosition.x && 
        newPosition.y === level.goalPosition.y
      ) {
        const nextLevelIndex = state.levelIndex + 1

        if (nextLevelIndex < levels.length) {
          newState.gameStatus = gameStatuses.loading
          setTimeout(() => {
            setState(loadLevel(state.levelIndex + 1))
          }, 300)
        } else {
          alert("You win!!")
        }
      }

      setState(newState)
    }
  }

  const handleResize = () => {
  }

  useEffect(() => {
    document.addEventListener("keydown", handleMove)
    document.documentElement.addEventListener("onresize", handleResize)

    return () =>{
      document.removeEventListener("keydown", handleMove)
      document.removeEventListener("resize", handleResize)
    }
  }, [state])

  const goalPosition = {
    x: (level.goalPosition.x * cellSize) + (cellSize / 2) - (playerSize / 2),
    y: (level.goalPosition.y * cellSize) + (cellSize / 2) - (playerSize / 2),
  }
  const playerPosition = {
    x: (position.x * cellSize) + (cellSize / 2) - (playerSize / 2),
    y: (position.y * cellSize) + (cellSize / 2) - (playerSize / 2),
  }

  if (state.gameStatus === gameStatuses.loading) {
    return null
  }

  return (
    <div 
      className="relative"
      style={{
        marginLeft: `${margin.left}px`,
        marginTop: `${margin.top}px`,
      }}
    >
      {Array.from(Array(rows).keys()).map(row => {
        return (
          <div className="flex" key={`row-${row}`}>
            {Array.from(Array(cols).keys()).map((col) => {
              let bgColor = "bg-black"
              let borderColor = "border-transparent"

              const cellValue = getCellValue(level, { x: col, y: row })
              if (cellValue === tileTypes.floor) {
                bgColor = "bg-white"
                borderColor = "border-gray-200"
              } else if (cellValue === tileTypes.wall) {
                bgColor = "bg-gray-700"
                borderColor = "border-gray-700"
              }

              return (
                <div 
                  className={`relative flex items-center justify-center border ${borderColor} ${bgColor} aspect-square`}
                  style={{ width: `${cellSize}px` }}
                  key={`col-${col}`}
                />
              )
            })}
          </div>
        )
      })}
      <div 
        className="absolute bg-yellow-600 rounded-full aspect-square"
        style={{
          width: `${playerSize}px`,
          left: `${goalPosition.x}px`,
          top: `${goalPosition.y}px`,
        }}
      />
      <div 
        className="absolute aspect-square bg-red-600 rounded-full transition-all duration-150"
        style={{
          width: `${playerSize}px`,
          left: `${playerPosition.x}px`,
          top: `${playerPosition.y}px`,
        }}
      />
    </div>
  )
}

createRoot(document.getElementById("app")).render(<App />)