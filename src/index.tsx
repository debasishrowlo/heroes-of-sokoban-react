import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"

const enum gameStatuses { 
  playing = "playing",
  win = "win",
}

const enum tileTypes {
  empty = 0,
  floor = 1,
  goal = 2,
}

type Level = {
  tilemap: Tilemap,
  cellsPerRow: number,
}

type Position = {
  x: number,
  y: number,
}

type Tilemap = number[]

type State = {
  level: Level,
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
  if (getCellValue(level, position) === 0) {
    return null
  }

  return position
}

const App = () => {
  const initialLevel = {
    tilemap: [
      0, 2, 0, 1, 0,
      1, 1, 1, 1, 0,
      0, 1, 1, 1, 1,
      0, 1, 1, 1, 0,
      0, 1, 1, 1, 0,
    ],
    cellsPerRow: 5,
  }
  const rows = Math.ceil(initialLevel.tilemap.length / initialLevel.cellsPerRow)
  const cols = initialLevel.cellsPerRow

  const cellSize = 50
  const playerSize = 30

  const [state, setState] = useState<State>({
    level: initialLevel,
    gameStatus: gameStatuses.playing,
    position: {
      x: 2,
      y: 2,
    },
    margin: {
      left: (window.innerWidth - (rows * cellSize)) / 2,
      top: (window.innerHeight - (cols * cellSize)) / 2,
    },
  })
  const { level, margin, position } = state

  const handleMove = (e:KeyboardEvent) => {
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

      const cellValue = getCellValue(level, newPosition)
      console.log({ cellValue, newPosition })
      if (cellValue === tileTypes.goal) {
        setTimeout(() => {
          console.log("load next level")
        }, 1000)
      }

      setState(newState)
    }
  }

  const handleResize = () => {
    console.log({
      left: (window.innerWidth - (rows * cellSize)),
      top: (window.innerHeight - (cols * cellSize)),
    })
  }

  useEffect(() => {
    document.addEventListener("keydown", handleMove)
    document.documentElement.addEventListener("onresize", handleResize)

    return () =>{
      document.removeEventListener("keydown", handleMove)
      document.removeEventListener("resize", handleResize)
    }
  }, [state])

  return (
    <div style={{
      marginLeft: `${margin.left}px`,
      marginTop: `${margin.top}px`,
    }}>
      {Array.from(Array(rows).keys()).map(row => {
        return (
          <div className="flex" key={`row-${row}`}>
            {Array.from(Array(cols).keys()).map((col) => {
              const hasCharacter = row === position.y && col === position.x

              let bgColor = "bg-black"
              let borderColor = "border-transparent"
              const cellValue = getCellValue(level, { x: col, y: row })
              if (
                cellValue === tileTypes.floor || 
                cellValue === tileTypes.goal
              ) {
                bgColor = "bg-white"
                borderColor = "border-gray-200"
              }

              const hasGoal = cellValue === tileTypes.goal

              return (
                <div 
                  className={`relative flex items-center justify-center border ${borderColor} ${bgColor} aspect-square`}
                  style={{ width: `${cellSize}px` }}
                  key={`col-${col}`}
                >
                  {hasGoal && (
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-600 rounded-full aspect-square"
                      style={{
                        width: `${playerSize}px`,
                      }}
                    ></div>
                  )}
                  {hasCharacter && (
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square bg-red-600 rounded-full"
                      style={{
                        width: `${playerSize}px`,
                      }}
                    ></div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

createRoot(document.getElementById("app")).render(<App />)