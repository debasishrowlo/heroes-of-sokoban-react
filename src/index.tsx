import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import classnames from "classnames"

import "./index.css"

import gateIcon from "./assets/gate.png"
import rock1 from "./assets/rock1.png"
import rock2 from "./assets/rock2.png"
import rock3 from "./assets/rock3.png"
import rock4 from "./assets/rock4.png"
import rock5 from "./assets/rock5.png"

const enum entityTypes {
  player = "player",
  rock = "rock",
}

const enum directions {
  up = "up",
  down = "down",
  left = "left",
  right = "right",
}

const enum gameStatuses { 
  loading = "loading",
  playing = "playing",
  paused = "paused",
  win = "win",
}

const enum playerTypes {
  warrior = "warrior",
  thief = "thief",
}

const enum tileTypes {
  empty = 0,
  floor = 1,
  wall = 2,
}

type Level = {
  tilemap: Tilemap,
  tilesPerRow: number,
  player: {
    type: playerTypes,
    position: V2,
  },
  goalPosition: V2,
  rocks?: V2[],
  switchGates?: SwitchGate[],
  playerType?: playerTypes,
}

type State = {
  levelIndex: number,
  gameStatus: gameStatuses,
  rocks: Array<{
    position: V2,
    img: string,
  }>,
  switchGates: SwitchGate[],
  player: {
    type: playerTypes,
    position: V2,
  },
  margin: {
    left: number,
    top: number,
  },
}

type SwitchGate = {
  position: V2,
  color: string,
  switches: V2[],
}

type Tilemap = number[]

type V2 = {
  x: number,
  y: number,
}

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
    player: {
      type: playerTypes.warrior,
      position: { x: 2, y: 2, },
    },
    goalPosition: {
      x: 10,
      y: 2,
    },
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
    player: {
      type: playerTypes.warrior,
      position: { x: 2, y: 2 },
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
      2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2,
      2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 13,
    switchGates: [
      {
        color: "#f7e26b",
        position: { x: 8, y: 3 },
        switches: [
          { x: 6, y: 2 },
        ],
      }
    ],
    player: {
      type: playerTypes.warrior,
      position: { x: 2, y: 2, },
    },
    rocks: [
      { x: 4, y: 2 },
    ],
    goalPosition: {
      x: 10,
      y: 2,
    },
  },
  {
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 1, 1, 2, 1, 2,
      2, 1, 2, 1, 1, 1, 2, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 9,
    player: {
      type: playerTypes.warrior,
      position: { x: 1, y: 4, },
    },
    rocks: [
      { x: 3, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
    ],
    switchGates: [
      {
        color: "#f7e26b",
        position: { x: 7, y: 2 },
        switches: [
          { x: 2, y: 5 },
          { x: 4, y: 5 },
          { x: 6, y: 5 },
        ],
      }
    ],
    goalPosition: {
      x: 7,
      y: 1,
    }
  },
  {
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2,
      2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 13,
    switchGates: [
      {
        color: "#f7e26b",
        position: { x: 8, y: 3 },
        switches: [
          { x: 6, y: 2 },
        ],
      }
    ],
    player: {
      type: playerTypes.thief,
      position: { x: 2, y: 2, },
    },
    rocks: [
      { x: 4, y: 2 },
      { x: 7, y: 1 },
      { x: 7, y: 3 },
    ],
    goalPosition: {
      x: 10,
      y: 2,
    },
  },
  {
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 1, 1, 2, 1, 2,
      2, 1, 2, 1, 1, 1, 2, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 9,
    player: {
      type: playerTypes.thief,
      position: { x: 1, y: 4, },
    },
    rocks: [
      { x: 3, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
    ],
    switchGates: [
      {
        color: "#f7e26b",
        position: { x: 7, y: 2 },
        switches: [
          { x: 2, y: 5 },
          { x: 4, y: 5 },
          { x: 6, y: 5 },
        ],
      }
    ],
    goalPosition: {
      x: 7,
      y: 1,
    }
  },
  {
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 2, 2, 1, 1, 2,
      2, 1, 2, 1, 1, 2, 2, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 2, 1, 2, 1, 2, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 9,
    player: {
      type: playerTypes.thief,
      position: { x: 5, y: 5, },
    },
    rocks: [
      { x: 3, y: 5 },
    ],
    switchGates: [
      {
        color: "#f7e26b",
        position: { x: 7, y: 2 },
        switches: [
          { x: 5, y: 3 },
        ],
      }
    ],
    goalPosition: { x: 6, y: 1, }
  },
]

const tileSize = 55
const playerSize = tileSize / 1.5

const v2Equal = (p1:V2, p2:V2) => {
  return p1.x === p2.x && p1.y === p2.y
}

const generateLevel = (index:number):State => {
  const rocks = [rock1, rock2, rock3, rock4, rock5]

  const level = levels[index]
  const state = {
    levelIndex: index,
    gameStatus: gameStatuses.playing,
    tilesPerRow: level.tilesPerRow,
    player: {
      type: level.player.type || playerTypes.warrior,
      position: { ...level.player.position },
    },
    rocks: level.rocks ? level.rocks.map(position => ({
      position,
      img: rocks[Math.floor(Math.random() * (rocks.length - 1))],
    })) : [],
    switchGates: level.switchGates ? level.switchGates : [],
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

const getTileValue = (level:Level, position:V2) => {
  return level.tilemap[position.y * level.tilesPerRow + position.x]
}

const getNextTileInDirection = (position:V2, direction:directions, rows:number, cols:number):V2 => {
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

const getPosition = (position:V2, width:number, height:number):V2 => {
  return {
    x: (position.x * tileSize) + (tileSize / 2) - (width / 2),
    y: (position.y * tileSize) + (tileSize / 2) - (height / 2),
  }
}

const isGateOpen = (gateIndex:number, state:State):boolean => {
  const gate = state.switchGates[gateIndex]

  const allSwitchesPressed = gate.switches.every(switchPosition => {
    const playerPosition = state.player.position
    const isPlayerOnSwitch = v2Equal(switchPosition, playerPosition)

    const isRockOnSwitch = state.rocks.some(
      rock => v2Equal(rock.position, switchPosition)
    )

    return isPlayerOnSwitch || isRockOnSwitch
  })

  const isOpen = allSwitchesPressed

  return isOpen
}

const pauseTransitions = (duration:number) => {
  document.documentElement.classList.add("disable-transitions")
  setTimeout(() => {
    document.documentElement.classList.remove("disable-transitions")
  }, duration)
}

const imagesToBeLoaded = [
  gateIcon,
  rock1,
  rock2,
  rock3,
  rock4,
  rock5,
]

const App = () => {
  const [state, setState] = useState<State>(generateLevel(0))
  const [loading, setLoading] = useState(true)

  const handleKeyDown = (e:KeyboardEvent) => {
    if (!state) { return }

    if (state.gameStatus !== gameStatuses.playing) {
      return 
    }

    if (e.key === "r" || e.key === "R") {
      pauseTransitions(150)
      loadLevel(state.levelIndex)
      return
    }

    let newState = { ...state }
    let direction:directions|null = null

    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      direction = directions.up
    } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      direction = directions.left
    } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      direction = directions.down
    } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      direction = directions.right
    }

    if (!direction) { return }

    const level = levels[state.levelIndex]
    const rows = getRows(level)
    const cols = level.tilesPerRow

    if (state.player.type === playerTypes.warrior) {
      let entitiesToBeMoved:Array<{
        type: entityTypes,
        index?: number,
      }> = [
        { type: entityTypes.player },
      ]

      let nextPosition = getNextTileInDirection(state.player.position, direction, rows, cols)
      while (true) {
        const tileValue = getTileValue(level, nextPosition)
        const tileIsFloor = tileValue === tileTypes.floor

        const rockIndex = state.rocks.findIndex(rock => v2Equal(rock.position, nextPosition))
        const tileContainsRock = rockIndex !== -1

        const gateIndex = state.switchGates.findIndex(gate => v2Equal(gate.position, nextPosition))
        const tileContainsGate = gateIndex !== -1

        let tileContainsClosedGate = false
        if (tileContainsGate) {
          const gateIsClosed = !isGateOpen(gateIndex, state)
          tileContainsClosedGate = gateIsClosed
        }

        const tileIsEmpty = (
          tileIsFloor && 
          !tileContainsRock && 
          !tileContainsClosedGate
        )

        const tileContainsWall = tileValue === tileTypes.wall

        if (tileIsEmpty) {
          break
        } 

        const tileContainsImmovableEntity = tileContainsWall || tileContainsClosedGate
        
        if (tileContainsImmovableEntity) {
          entitiesToBeMoved = []
          break
        } 

        const tileContainsMovableEntity = tileContainsRock
        
        if (tileContainsMovableEntity) {
          entitiesToBeMoved = [
            ...entitiesToBeMoved,
            {
              type: entityTypes.rock,
              index: rockIndex,
            }
          ]
        }

        nextPosition = getNextTileInDirection(nextPosition, direction, rows, cols)
      }
      
      for (let i = 0; i < entitiesToBeMoved.length; i++) {
        const entity = entitiesToBeMoved[i]

        if (entity.type === entityTypes.player) {
          const entityPosition = state.player.position
          const nextPosition = getNextTileInDirection(entityPosition, direction, rows, cols)
          newState = {
            ...state,
            player: {
              ...state.player,
              position: { ...nextPosition },
            }
          }
        } else if (entity.type === entityTypes.rock) {
          const rock = state.rocks[entity.index]
          const nextPosition = getNextTileInDirection(rock.position, direction, rows, cols)
          newState = {
            ...newState,
            rocks: [
              ...newState.rocks.slice(0, entity.index),
              {
                ...newState.rocks[entity.index],
                position: { ...nextPosition },
              },
              ...newState.rocks.slice(entity.index + 1),
            ]
          }
        }
      }
    } else if (state.player.type === playerTypes.thief) {
      const nextPosition = getNextTileInDirection(state.player.position, direction, rows, cols)

      const tileValue = getTileValue(level, nextPosition)
      const tileContainsWall = tileValue === tileTypes.wall

      const gateIndex = state.switchGates.findIndex(gate => v2Equal(gate.position, nextPosition))
      const tileContainsGate = gateIndex !== -1

      let tileContainsClosedGate = false
      if (tileContainsGate) {
        const gateIsClosed = !isGateOpen(gateIndex, state)
        tileContainsClosedGate = gateIsClosed
      }

      const tileContainsRock = state.rocks.find(rock => v2Equal(rock.position, nextPosition))

      const tileContainsEntity = tileContainsRock || tileContainsWall || tileContainsClosedGate

      if (!tileContainsEntity) {
        const currentPosition = newState.player.position

        let oppositeDirection:directions = null
        if (direction === directions.up) {
          oppositeDirection = directions.down
        } else if (direction === directions.down) {
          oppositeDirection = directions.up
        } else if (direction === directions.left) {
          oppositeDirection = directions.right
        } else if (direction === directions.right) {
          oppositeDirection = directions.left
        }

        const oppositePosition = getNextTileInDirection(
          currentPosition, oppositeDirection, rows, cols
        )

        const rockIndex = state.rocks.findIndex(rock => v2Equal(rock.position, oppositePosition))
        const oppositeTileContainsRock = rockIndex !== -1

        if (oppositeTileContainsRock) {
          newState = {
            ...newState,
            rocks: [
              ...newState.rocks.slice(0, rockIndex),
              {
                ...newState.rocks[rockIndex],
                position: currentPosition,
              },
              ...newState.rocks.slice(rockIndex + 1),
            ]
          }
        }

        newState = {
          ...newState,
          player: {
            ...newState.player,
            position: nextPosition,
          }
        }
      }
    }

    if (v2Equal(newState.player.position, level.goalPosition)) {
      const nextLevelIndex = state.levelIndex + 1

      newState.gameStatus = gameStatuses.paused
      if (nextLevelIndex < levels.length) {
        setTimeout(() => {
          newState.gameStatus = gameStatuses.loading
          pauseTransitions(150)
          loadLevel(state.levelIndex + 1)
        }, 500)
      } else {
        alert("You win!!")
      }
    }

    setState(newState)
  }

  const loadLevel = (index:number) => {
    setState(generateLevel(index))
  }

  const preloadImages = async () => {
    const imagePromises = imagesToBeLoaded.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image()

        img.src = src
        img.onload = () => { resolve(img) }
        img.onerror = () => { reject(src) }
      })
    })

    await Promise.all(imagePromises)

    setLoading(false)
  }

  const showLevelSelect = () => {
    setState(null)
  }

  useEffect(() => {
    preloadImages()
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => { document.removeEventListener("keydown", handleKeyDown) }
  }, [state])

  if (loading) { return null }

  if (state === null) {
    return (
      <div className="container h-screen mx-auto flex items-center justify-center">
        <div>
          <h1 className="text-20 text-white">Select Level</h1>
          <div className="mt-4 flex gap-6">
            {levels.map((level, index) => {
              return (
                <button 
                  type="button" 
                  className="w-20 aspect-square bg-gray-200 hover:bg-gray-300 text-24 font-bold text-gray-600 rounded-6" 
                  key={index}
                  onClick={() => loadLevel(index)}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (state.gameStatus === gameStatuses.loading) {
    return null
  }

  const level = levels[state.levelIndex]
  const rows = getRows(level)
  const cols = level.tilesPerRow

  const goalPosition = getPosition(level.goalPosition, tileSize, tileSize)
  const playerPosition = getPosition(state.player.position, playerSize, playerSize)

  return (
    <>
      <div className="px-6 fixed top-0 right-0">
        <button
          type="button" 
          className="p-4 text-18 text-gray-100"
          onClick={() => showLevelSelect()}
        >
          Levels
        </button>
      </div>
      <div
        className="relative"
        style={{
          marginLeft: `${state.margin.left}px`,
          marginTop: `${state.margin.top}px`,
        }}
      >
        {Array.from(Array(rows).keys()).map((row, index) => {
          return (
            <div className="flex" key={`row-${index}`}>
              {Array.from(Array(cols).keys()).map((col, index) => {
                let bgColor = "bg-transparent"
                let borderColor = "border-transparent"

                const tileValue = getTileValue(level, { x: col, y: row })
                if (tileValue === tileTypes.floor) {
                  bgColor = "bg-gray-100"
                  borderColor = "border-gray-300"
                } else if (tileValue === tileTypes.wall) {
                  bgColor = "bg-gray-700"
                  borderColor = "border-gray-700"
                }

                return (
                  <div 
                    className={`relative flex items-center justify-center border ${borderColor} ${bgColor} aspect-square`}
                    style={{ width: `${tileSize}px` }}
                    key={`col-${index}`}
                  />
                )
              })}
            </div>
          )
        })}
        <div
          className="absolute p-1"
          style={{
            width: `${tileSize}px`,
            height: `${tileSize}px`,
            left: `${goalPosition.x}px`,
            top: `${goalPosition.y}px`,
          }}
        >
          <img src={gateIcon} />
        </div>
        {state.switchGates.map((gate:SwitchGate, index:number) => {
          const size = tileSize
          const position = getPosition(gate.position, size, size)

          const isOpen = isGateOpen(index, state)
          const highlightSize = size / 5

          return (
            <div key={`gate-${index}`}>
              <div
                className="absolute aspect-square transition-all"
                style={{
                  width: `${size}px`,
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  backgroundColor: isOpen ? "transparent" : gate.color,
                }}
              >
                {[
                  { 
                    open: { left: 0, top: 0 },
                    closed: { left: highlightSize, top: 0 },
                  },
                  {
                    open: { left: highlightSize * 4, top: 0, },
                    closed: { left: highlightSize * 3, top: 0, },
                  },

                  {
                    open: { left: 0, top: 0, },
                    closed: { left: 0, top: highlightSize, },
                  },
                  {
                    open: { left: highlightSize * 4, top: 0, },
                    closed: { left: highlightSize * 4, top: highlightSize, },
                  },
                  
                  {
                    open: { left: 0, top: highlightSize * 4, },
                    closed: { left: 0, top: highlightSize * 3, },
                  },
                  {
                    open: { left: highlightSize * 4, top: highlightSize * 4, },
                    closed: { left: highlightSize * 4, top: highlightSize * 3, },
                  },

                  {
                    open: { left: 0, top: highlightSize * 4, },
                    closed: { left: highlightSize, top: highlightSize * 4, },
                  },
                  {
                    open: { left: highlightSize * 4, top: highlightSize * 4, },
                    closed: { left: highlightSize * 3, top: highlightSize * 4, },
                  }
                ].map((highlight, index) => {
                  const left = isOpen ? highlight.open.left : highlight.closed.left
                  const top = isOpen ? highlight.open.top : highlight.closed.top

                  return (
                    <div
                      className={classnames("absolute aspect-square transition-all", {
                        "brightness-75": !isOpen,
                      })} 
                      key={`closed-highlight-${index}`}
                      style={{
                        backgroundColor: gate.color,
                        width: `${highlightSize}px`,
                        left: `${left}px`,
                        top: `${top}px`,
                      }}
                    ></div>
                  )
                })}
              </div>
              {gate.switches.map((switchPosition, index) => {
                const size = tileSize / 3
                const position = getPosition(switchPosition, size, size)

                return (
                  <div 
                    className="w-10 aspect-square absolute border border-gray-400"
                    key={`switch-${index}`}
                    style={{
                      width: `${size}px`,
                      left: `${position.x}px`,
                      top: `${position.y}px`,
                      backgroundColor: gate.color,
                    }}
                  >
                  </div>
                )
              })}
            </div>
          )
        })}
        {state.rocks.map((rock, index) => {
          const position = getPosition(rock.position, tileSize, tileSize)

          return (
            <div 
              className="p-1.5 absolute flex items-center justify-center transition-all"
              key={`rock-${index}`}
              style={{
                width: `${tileSize}px`,
                height: `${tileSize}px`,
                left: `${position.x}px`,
                top: `${position.y}px`,
              }}
            >
              <img src={rock.img} className="w-full" />
            </div>
          )
        })}
        <div 
          className={classnames("absolute aspect-square rounded-full transition-all", {
            "bg-red-600": state.player.type === playerTypes.warrior,
            "bg-green-600": state.player.type === playerTypes.thief,
          })}
          style={{
            width: `${playerSize}px`,
            left: `${playerPosition.x}px`,
            top: `${playerPosition.y}px`,
          }}
        />
      </div>
    </>
  )
}

createRoot(document.getElementById("app")).render(<App />)