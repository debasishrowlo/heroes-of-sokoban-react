import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"

const enum entityTypes {
  player = "player",
  rock = "rock",
}

const enum gameStatuses { 
  loading = "loading",
  playing = "playing",
  paused = "paused",
  win = "win",
}

const enum tileTypes {
  empty = 0,
  floor = 1,
  wall = 2,
}

const enum directions {
  up = "up",
  down = "down",
  left = "left",
  right = "right",
}

type Level = {
  tilemap: Tilemap,
  tilesPerRow: number,
  playerPosition: Position,
  goalPosition: Position,
  rocks: Position[],
}

type Position = {
  x: number,
  y: number,
}

type State = {
  levelIndex: number,
  gameStatus: gameStatuses,
  rocks: Position[],
  position: Position,
  margin: {
    left: number,
    top: number,
  },
}

type Tilemap = number[]

// TODO: Automatically surround level with walls
const levels:Level[] = [
  {
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 13,
    rocks: [],
    playerPosition: {
      x: 2,
      y: 2,
    },
    goalPosition: {
      x: 10,
      y: 2,
    }
  },
  {
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 13,
    rocks: [
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
      { x: 8, y: 2 },
      { x: 9, y: 2 },
      { x: 10, y: 1 },
      { x: 10, y: 3 },
    ],
    playerPosition: {
      x: 2,
      y: 2,
    },
    goalPosition: {
      x: 10,
      y: 2,
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
    rocks: [],
    tilesPerRow: 7,
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
    rocks: [],
    tilesPerRow: 7,
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

const tileSize = 50
const playerSize = 30

const arePositionsSame = (p1:Position, p2:Position) => {
  return p1.x === p2.x && p1.y === p2.y
}

const getTileValue = (level:Level, position:Position) => {
  return level.tilemap[position.y * level.tilesPerRow + position.x]
}

const getNextTileInDirection = (position:Position, direction:directions, rows:number, cols:number):Position => {
  if (direction === directions.up) {
    return {
      ...position,
      y: Math.max(0, position.y - 1),
    }
  } else if (direction === directions.down) {
    return {
      ...position,
      y: Math.min(rows - 1, position.y + 1),
    }
  } else if (direction === directions.left) {
    return {
      ...position,
      x: Math.max(0, position.x - 1)
    }
  } else {
    return {
      ...position,
      x: Math.min(cols - 1, position.x + 1)
    }
  }
}

const getRows = (level:Level) => {
  return Math.ceil(level.tilemap.length / level.tilesPerRow)
}

const getNextPosition = (state:State, level:Level, position:Position):State|null => {
  if (getTileValue(level, position) !== tileTypes.floor) {
    return null
  }

  return {
    ...state,
    position: { ...position },
  }
}

const getPosition = (position:Position, size:number):Position => {
  return {
    x: (position.x * tileSize) + (tileSize / 2) - (size / 2),
    y: (position.y * tileSize) + (tileSize / 2) - (size / 2),
  }
}

const loadLevel = (index:number):State => {
  const level = levels[index]
  const state = {
    levelIndex: index,
    gameStatus: gameStatuses.playing,
    tilesPerRow: level.tilesPerRow,
    position: { ...level.playerPosition },
    rocks: level.rocks.map(rock => ({ ...rock })),
    margin: {
      left: 0,
      top: 0,
    },
  }
  const rows = getRows(level)
  const cols = level.tilesPerRow
  state.margin.left = (window.innerWidth - (cols * tileSize)) / 2
  state.margin.top = (window.innerHeight - (rows * tileSize)) / 2

  return state
}

const App = () => {
  const [state, setState] = useState<State>(loadLevel(0))
  const { margin, position } = state

  const level = levels[state.levelIndex]
  const rows = getRows(level)
  const cols = level.tilesPerRow

  const handleKeyDown = (e:KeyboardEvent) => {
    if (state.gameStatus !== gameStatuses.playing) {
      return 
    }

    if (e.key === "r") {
      setState(loadLevel(state.levelIndex))
      return
    }

    let newState = { ...state }
    let direction:directions|null = null

    if (e.key === "ArrowUp" || e.key === "w") {
      direction = directions.up
    } else if (e.key === "ArrowLeft" || e.key === "a") {
      direction = directions.left
    } else if (e.key === "ArrowDown" || e.key === "s") {
      direction = directions.down
    } else if (e.key === "ArrowRight" || e.key === "d") {
      direction = directions.right
    }

    if (!direction) {
      return
    }

    let entitiesToBeMoved:Array<{
      type: entityTypes,
      index?: number,
    }> = [
      { type: entityTypes.player },
    ]

    let nextPosition = getNextTileInDirection(position, direction, rows, cols)
    while (true) {
      const tileValue = getTileValue(level, nextPosition)
      const rockIndex = state.rocks.findIndex(rockPosition => arePositionsSame(rockPosition, nextPosition))

      const containsRock = rockIndex !== -1
      if (tileValue === tileTypes.floor && !containsRock) {
        break
      }
      if (tileValue === tileTypes.wall) {
        entitiesToBeMoved = []
        break
      }

      if (containsRock) {
        entitiesToBeMoved.push({
          type: entityTypes.rock,
          index: rockIndex,
        })
      }

      nextPosition = getNextTileInDirection(nextPosition, direction, rows, cols)
    }
    
    for (let i = 0; i < entitiesToBeMoved.length; i++) {
      const entity = entitiesToBeMoved[i]

      if (entity.type === entityTypes.player) {
        const entityPosition = state.position
        const nextPosition = getNextTileInDirection(entityPosition, direction, rows, cols)
        newState = getNextPosition(state, level, nextPosition)
      } else if (entity.type === entityTypes.rock) {
        const entityPosition = state.rocks[entity.index]
        const nextPosition = getNextTileInDirection(entityPosition, direction, rows, cols)
        newState = {
          ...newState,
          rocks: [
            ...newState.rocks.slice(0, entity.index),
            { ...nextPosition },
            ...newState.rocks.slice(entity.index + 1),
          ]
        }
      }
    }

    if (arePositionsSame(newState.position, level.goalPosition)) {
      const nextLevelIndex = state.levelIndex + 1

      newState.gameStatus = gameStatuses.paused
      if (nextLevelIndex < levels.length) {
        setTimeout(() => {
          newState.gameStatus = gameStatuses.loading
          setState(loadLevel(state.levelIndex + 1))
        }, 500)
      } else {
        alert("You win!!")
      }
    }

    setState(newState)
  }

  const handleResize = () => {
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    document.documentElement.addEventListener("onresize", handleResize)

    return () =>{
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("resize", handleResize)
    }
  }, [state])

  const goalPosition = getPosition(level.goalPosition, playerSize)
  const playerPosition = getPosition(position, playerSize)

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

              const tileValue = getTileValue(level, { x: col, y: row })
              if (tileValue === tileTypes.floor) {
                bgColor = "bg-white"
                borderColor = "border-gray-200"
              } else if (tileValue === tileTypes.wall) {
                bgColor = "bg-gray-700"
                borderColor = "border-gray-700"
              }

              return (
                <div 
                  className={`relative flex items-center justify-center border ${borderColor} ${bgColor} aspect-square`}
                  style={{ width: `${tileSize}px` }}
                  key={`col-${col}`}
                />
              )
            })}
          </div>
        )
      })}
      <div 
        className="absolute bg-green-400 rounded-full aspect-square"
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
      {state.rocks.map(rockPosition => {
        const size = playerSize
        const position = getPosition(rockPosition, size)

        return (
          <div 
            className="absolute aspect-square bg-amber-600 rounded-full transition-all duration-150"
            style={{
              width: `${size}px`,
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          />
        )
      })}
    </div>
  )
}

createRoot(document.getElementById("app")).render(<App />)