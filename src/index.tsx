import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"

type Position = {
  x: number,
  y: number,
}

type Level = {
  tilemap: Tilemap,
  cellsPerRow: number,
}

type Tilemap = number[]

type State = {
  level: Level,
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
  const levelTilemap = [
    0, 1, 0, 1, 0,
    1, 1, 1, 1, 0,
    0, 1, 1, 1, 1,
    0, 1, 1, 1, 0,
    0, 1, 1, 1, 0,
  ]
  const initialLevel = {
    tilemap: levelTilemap,
    cellsPerRow: 5,
  }
  const rows = Math.ceil(initialLevel.tilemap.length / initialLevel.cellsPerRow)
  const cols = initialLevel.cellsPerRow

  const cellSize = 50
  const playerSize = 30

  const [state, setState] = useState<State>({
    level: initialLevel,
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
      setState({ ...state, position: newPosition })
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
              if (cellValue === 1) {
                bgColor = "bg-white"
                borderColor = "border-gray-200"
              }

              return (
                <div 
                  className={`flex items-center justify-center border ${borderColor} ${bgColor} aspect-square`}
                  style={{ width: `${cellSize}px` }}
                  key={`col-${col}`}
                >
                  {hasCharacter && (
                    <div 
                      className="aspect-square bg-red-600 rounded-full"
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