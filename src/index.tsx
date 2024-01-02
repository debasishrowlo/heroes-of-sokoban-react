import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"

const App = () => {
  const rows = 10
  const cols = 10
  const cellSize = 50
  const playerSize = 30

  type Position = {
    x: number,
    y: number,
  }

  const [state, setState] = useState<{
    position: Position,
    margin: {
      left: number,
      top: number,
    },
  }>({
    position: {
      x: 5,
      y: 5,
    },
    margin: {
      left: (window.innerWidth - (rows * cellSize)) / 2,
      top: (window.innerHeight - (cols * cellSize)) / 2,
    },
  })
  const { margin, position } = state

  const handleMove = (e:KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "w") {
      setState({ ...state, position: { ...position, y: Math.max(0, position.y - 1) }})
    } else if (e.key === "ArrowLeft" || e.key === "a") {
      setState({ ...state, position: { ...position, x: Math.max(0, position.x - 1) }})
    } else if (e.key === "ArrowDown" || e.key === "s") {
      setState({ ...state, position: { ...position, y: Math.min(rows - 1, position.y + 1) }})
    } else if (e.key === "ArrowRight" || e.key === "d") {
      setState({ ...state, position: { ...position, x: Math.min(cols - 1, position.x + 1) }})
    }
  }

  const handleResize = () => {
    console.log("resized")
    console.log({
      left: (window.innerWidth - (rows * cellSize)),
      top: (window.innerHeight - (cols * cellSize)),
    })
    // setMargin({
    //   left: (window.innerWidth - (rows * cellSize)),
    //   top: (window.innerHeight - (cols * cellSize)),
    // })
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

              return (
                <div 
                  className="flex items-center justify-center border border-gray-200 bg-white aspect-square" 
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