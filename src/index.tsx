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
import tilesetImage from "./assets/tileset.png"

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
  wizard = "wizard",
}

const enum tileTypes {
  empty = 0,
  floor = 1,
  wall = 2,
}

type Level = {
  popupMessage?: string,
  tilemap: Tilemap,
  tilesPerRow: number,
  players: Array<{
    type: playerTypes,
    position: V2,
  }>,
  goals: V2[],
  rocks?: V2[],
  switchGates?: SwitchGate[],
}

type State = {
  levelIndex: number,
  gameStatus: gameStatuses,
  popup: {
    visible: boolean,
    message: string,
  },
  rocks: Array<{
    position: V2,
    img: string,
  }>,
  switchGates: SwitchGate[],
  teleportBeam: {
    visible: boolean,
    width: number,
    position: V2,
    rotation: number,
  },
  players: Array<{
    type: playerTypes,
    position: V2,
  }>,
  activePlayerIndex: number,
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
    popupMessage: `Use W, A, S, D or arrow keys to move`,
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 13,
    players: [
      {
        type: playerTypes.warrior,
        position: { x: 2, y: 2, },
      },
    ],
    goals: [{ x: 10, y: 2 }],
  },
  {
    popupMessage: "Red warrior pushes blocks",
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
    players: [
      {
        type: playerTypes.warrior,
        position: { x: 2, y: 2 },
      },
    ],
    goals: [{ x: 10, y: 2 }],
  },
  {
    popupMessage: "Hold down Switches to open doors",
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
    players: [
      {
        type: playerTypes.warrior,
        position: { x: 2, y: 2, },
      },
    ],
    rocks: [
      { x: 4, y: 2 },
    ],
    goals: [{ x: 10, y: 2 }],
  },
  {
    popupMessage: `Press "R" to reset a level`,
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
    players: [
      {
        type: playerTypes.warrior,
        position: { x: 1, y: 4, },
      },
    ],
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
    goals: [{ x: 7, y: 1 }],
  },
  {
    popupMessage: "Green thief pulls blocks",
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
    players: [
      {
        type: playerTypes.thief,
        position: { x: 2, y: 2, },
      },
    ],
    rocks: [
      { x: 4, y: 2 },
      { x: 7, y: 1 },
      { x: 7, y: 3 },
    ],
    goals: [{ x: 10, y: 2 }],
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
    players: [
      {
        type: playerTypes.thief,
        position: { x: 1, y: 4, },
      },
    ],
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
    goals: [{ x: 7, y: 1 }],
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
    players: [
      {
        type: playerTypes.thief,
        position: { x: 5, y: 5, },
      },
    ],
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
    goals: [{ x: 6, y: 1 }],
  },
  {
    popupMessage: "Blue Wizard teleports to blocks",
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 13,
    switchGates: [
      {
        color: "#f7e26b",
        position: { x: 8, y: 2 },
        switches: [
          { x: 6, y: 1 },
          { x: 6, y: 2 },
        ],
      }
    ],
    players: [
      {
        type: playerTypes.wizard,
        position: { x: 2, y: 2, },
      },
    ],
    rocks: [
      { x: 4, y: 1 },
      { x: 4, y: 2 },
    ],
    goals: [{ x: 10, y: 2 }],
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
    players: [
      {
        type: playerTypes.wizard,
        position: { x: 5, y: 3, },
      },
    ],
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
    goals: [{ x: 7, y: 1 }],
  },
  {
    tilemap: [
      2, 2, 2, 2, 2, 2, 2,
      2, 1, 2, 1, 2, 1, 2,
      2, 1, 2, 1, 2, 1, 2,
      2, 1, 1, 1, 1, 1, 2,
      2, 1, 2, 2, 2, 1, 2,
      2, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 7,
    players: [
      {
        type: playerTypes.wizard,
        position: { x: 1, y: 1, },
      },
    ],
    rocks: [
      { x: 1, y: 3 },
      { x: 1, y: 5 },
      { x: 3, y: 5 },
      { x: 5, y: 3 },
      { x: 5, y: 1 },
    ],
    goals: [{ x: 3, y: 1 }],
  },
  {
    popupMessage: `Press "X" to switch heroes`,
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 
      2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 
      2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 
      2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 
      2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 
    ],
    tilesPerRow: 13,
    players: [
      {
        type: playerTypes.warrior,
        position: { x: 2, y: 2, },
      },
      {
        type: playerTypes.wizard,
        position: { x: 2, y: 6, },
      },
    ],
    rocks: [],
    switchGates: [
      {
        color: "#f7e26b",
        position: { x: 8, y: 2 },
        switches: [
          { x: 6, y: 6 },
        ],
      },
      {
        color: "#621fc3",
        position: { x: 4, y: 6 },
        switches: [
          { x: 6, y: 2 },
        ],
      },
    ],
    goals: [
      { x: 10, y: 2 },
      { x: 10, y: 6 },
    ],
  },
]

const tileSize = 55
const playerSize = tileSize / 1.5

const imagesToBeLoaded = [
  gateIcon,
  rock1,
  rock2,
  rock3,
  rock4,
  rock5,
  tilesetImage,
]

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
    popup: {
      visible: level.popupMessage ? true : false,
      message: level.popupMessage || "",
    },
    teleportBeam: {
      visible: false,
      width: 0,
      position: { x: 0, y: 0 },
      rotation: 0,
    },
    players: level.players.map(player => ({ ...player })),
    activePlayerIndex: 0,
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
    const isPlayerOnSwitch = state.players.some(player => {
      return v2Equal(switchPosition, player.position)
    })

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

const xKeyPressed = (key:KeyboardEvent["key"]) => {
  return key === "x" || key === "X"
}

const App = () => {
  const [state, setState] = useState<State>(generateLevel(0))
  const [loading, setLoading] = useState(true)

  const handleKeyDown = (e:KeyboardEvent) => {
    const key = e.key

    if (!state) { return }

    if (
      state.gameStatus === gameStatuses.loading ||
      state.gameStatus === gameStatuses.paused
    ) {
      return
    }

    if (state.gameStatus === gameStatuses.win) {
      if (xKeyPressed(key)) {
        showLevelSelect()
      }
      return
    }

    if (state.popup.visible) {
      if (xKeyPressed(key)) {
        setState({
          ...state,
          popup: {
            ...state.popup,
            visible: false,
          },
        })
      }

      return
    }

    const rKeyPressed = key === "r" || key === "R"

    if (rKeyPressed) {
      pauseTransitions(150)
      loadLevel(state.levelIndex)
      return
    }

    if (xKeyPressed(key)) {
      const nextActivePlayerIndex = (state.activePlayerIndex + 1) % state.players.length
      setState({
        ...state,
        activePlayerIndex: nextActivePlayerIndex,
      })
      return
    }

    let newState = { ...state }
    let direction:directions|null = null

    const upKeyPressed = (key === "ArrowUp" || key === "w" || key === "W")
    const downKeyPressed = (key === "ArrowDown" || key === "s" || key === "S")
    const leftKeyPressed = (key === "ArrowLeft" || key === "a" || key === "A")
    const rightKeyPressed = (key === "ArrowRight" || key === "d" || key === "D")

    if (upKeyPressed) { direction = directions.up }
    else if (leftKeyPressed) { direction = directions.left }
    else if (downKeyPressed) { direction = directions.down }
    else if (rightKeyPressed) { direction = directions.right }

    if (!direction) { return }

    const level = levels[state.levelIndex]
    const rows = getRows(level)
    const cols = level.tilesPerRow
    const player = state.players[state.activePlayerIndex]

    if (player.type === playerTypes.warrior) {
      let entitiesToBeMoved:Array<{
        type: entityTypes,
        index?: number,
      }> = [
        { type: entityTypes.player },
      ]

      let nextPosition = getNextTileInDirection(player.position, direction, rows, cols)
      while (true) {
        const tileValue = getTileValue(level, nextPosition)

        const rockIndex = state.rocks.findIndex(rock => v2Equal(rock.position, nextPosition))
        const tileContainsRock = rockIndex !== -1

        const gateIndex = state.switchGates.findIndex(gate => v2Equal(gate.position, nextPosition))
        const tileContainsGate = gateIndex !== -1

        let tileContainsClosedGate = false
        if (tileContainsGate) {
          const gateIsClosed = !isGateOpen(gateIndex, state)
          tileContainsClosedGate = gateIsClosed
        }

        const tileContainsWall = tileValue === tileTypes.wall

        const tileIsEmpty = (
          !tileContainsWall &&
          !tileContainsRock && 
          !tileContainsClosedGate
        )

        if (tileIsEmpty) {
          break
        }

        const tileContainsImmovableEntity = (
          tileContainsWall || 
          tileContainsClosedGate
        )
        
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
          const entityPosition = player.position
          const nextPosition = getNextTileInDirection(entityPosition, direction, rows, cols)
          newState = {
            ...state,
            players: [
              ...state.players.slice(0, state.activePlayerIndex),
              {
                ...player,
                position: { ...nextPosition },
              },
              ...state.players.slice(state.activePlayerIndex + 1),
            ],
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
    } else if (player.type === playerTypes.thief) {
      const nextPosition = getNextTileInDirection(player.position, direction, rows, cols)

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
        const currentPosition = newState.players[newState.activePlayerIndex].position

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
          players: [
            ...newState.players.slice(0, newState.activePlayerIndex),
            {
              ...newState.players[newState.activePlayerIndex],
              position: nextPosition,
            },
            ...newState.players.slice(newState.activePlayerIndex + 1),
          ],
        }
      }
    } else if (player.type === playerTypes.wizard) {
      let rockInDirection = null

      let currentPosition = { ...player.position }
      let nextPositionContainsImmovableEntity = false

      while(!nextPositionContainsImmovableEntity) {
        const rockIndex = state.rocks.findIndex(rock => v2Equal(rock.position, currentPosition))
        const tileContainsRock = rockIndex !== -1

        if (tileContainsRock) {
          rockInDirection = rockIndex
          break
        }

        currentPosition = getNextTileInDirection(currentPosition, direction, rows, cols)

        const tileValue = getTileValue(level, currentPosition)
        const tileContainsWall = tileValue === tileTypes.wall

        const gateIndex = state.switchGates.findIndex(gate => v2Equal(gate.position, currentPosition))
        const tileContainsGate = gateIndex !== -1

        let tileContainsClosedGate = false
        if (tileContainsGate) {
          const gateIsClosed = !isGateOpen(gateIndex, state)
          tileContainsClosedGate = gateIsClosed
        }

        const tileContainsImmovableEntity = (
          tileContainsWall || 
          tileContainsClosedGate
        )

        nextPositionContainsImmovableEntity = tileContainsImmovableEntity
      }

      const rockAvailableToSwap = rockInDirection !== null

      if (rockAvailableToSwap) {
        const playerPosition = { ...player.position }
        const rockPosition = state.rocks[rockInDirection].position
        const rockIndex = rockInDirection

        const teleportBeam = {
          visible: true,
          width: 0,
          position: { 
            x: 0,
            y: 0,
          },
          rotation: 0,
        }

        let startPosition:V2|null = null
        let endPosition:V2|null = null

        if (playerPosition.x < rockPosition.x) {
          startPosition = { ...playerPosition }
          endPosition = { ...rockPosition }
        } else {
          startPosition = { ...rockPosition }
          endPosition = { ...playerPosition }
        }

        teleportBeam.position = {
          x: (startPosition.x * tileSize) + (tileSize / 2),
          y: (startPosition.y * tileSize) + (tileSize / 2),
        }
        if (startPosition.y < endPosition.y) {
          teleportBeam.rotation = 90
        } else if (startPosition.y > endPosition.y) {
          teleportBeam.rotation = -90
        }

        if (teleportBeam.rotation === 0) {
          teleportBeam.width = Math.abs((endPosition.x - startPosition.x)) * tileSize
        } else {
          teleportBeam.width = Math.abs((endPosition.y - startPosition.y)) * tileSize
        }

        newState = {
          ...state,
          rocks: [
            ...state.rocks.slice(0, rockIndex),
            {
              ...state.rocks[rockIndex],
              position: { ...playerPosition },
            },
            ...state.rocks.slice(rockIndex + 1),
          ],
          teleportBeam,
          players: [
            ...state.players.slice(0, state.activePlayerIndex),
            {
              ...player,
              position: { ...rockPosition },
            },
            ...state.players.slice(state.activePlayerIndex + 1),
          ]
        }
      } else {
        const nextPosition = getNextTileInDirection(player.position, direction, rows, cols)

        const tileValue = getTileValue(level, nextPosition)
        const tileContainsWall = tileValue === tileTypes.wall

        const gateIndex = state.switchGates.findIndex(gate => v2Equal(gate.position, nextPosition))
        const tileContainsGate = gateIndex !== -1

        let tileContainsClosedGate = false
        if (tileContainsGate) {
          const gateIsClosed = !isGateOpen(gateIndex, state)
          tileContainsClosedGate = gateIsClosed
        }
        
        const tileContainsImmovableEntity = tileContainsWall || tileContainsClosedGate

        if (!tileContainsImmovableEntity) {
          newState = {
            ...state,
            players: [
              ...state.players.slice(0, state.activePlayerIndex),
              {
                ...player,
                position: { ...nextPosition },
              },
              ...state.players.slice(state.activePlayerIndex + 1),
            ],
          }
        }
      }
    }

    const goalsOccupiedByPlayers = level.goals.every((goalPosition) => {
      const occupiedByPlayer = newState.players.some(player => v2Equal(player.position, goalPosition))
      return occupiedByPlayer
    })

    const levelCleared = goalsOccupiedByPlayers
    let allLevelsCleared = false

    if (levelCleared) {
      const nextLevelIndex = state.levelIndex + 1
      const nextLevelAvailable = nextLevelIndex < levels.length

      if (nextLevelAvailable) {
        newState.gameStatus = gameStatuses.paused
        setTimeout(() => {
          newState.gameStatus = gameStatuses.loading
          pauseTransitions(150)
          loadLevel(state.levelIndex + 1)
        }, 500)
      } else {
        allLevelsCleared = true
      }
    }

    if (allLevelsCleared) {
      setTimeout(() => {
        setState({ ...newState, gameStatus: gameStatuses.win })
      }, 500)
    }

    setState(newState)
    if (newState.teleportBeam.visible) {
      setTimeout(() => {
        setState({
          ...newState,
          teleportBeam: {
            ...newState.teleportBeam, 
            visible: false,
          },
        })
      }, 150)
    }
  }

  const handleResize = () => {
    if (state && state.gameStatus === gameStatuses.playing) {
      const level = levels[state.levelIndex]
      const rows = getRows(level)
      const cols = level.tilesPerRow
      setState({
        ...state,
        margin: {
          left: (window.innerWidth - (cols * tileSize)) / 2,
          top: (window.innerHeight - (rows * tileSize)) / 2,
        },
      })
    }
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
    window.addEventListener("resize", handleResize)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("resize", handleResize)
    }
  }, [state])

  if (loading) { return null }

  if (state === null) {
    return (
      <div className="container h-screen mx-auto flex items-center justify-center max-w-2xl">
        <div>
          <h1 className="text-20 text-white">Select Level</h1>
          <div className="mt-4 flex flex-wrap gap-6">
            {levels.map((level, index) => {
              return (
                <button 
                  type="button" 
                  className="w-20 aspect-square bg-gray-200 hover:bg-gray-400 text-24 font-bold text-gray-800 rounded-6" 
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

  if (state.gameStatus === gameStatuses.win) {
    return (
      <div className="fixed w-full h-full flex items-center justify-center">
        <div className="px-20 py-20 flex-col border border-white rounded-xl">
          <p className="text-center text-28 text-white">Thank you for playing</p>
          <p className="mt-14 text-center text-20 text-white">Press "x" to continue</p>
        </div>
      </div>
    )
  }


  const level = levels[state.levelIndex]
  const rows = getRows(level)
  const cols = level.tilesPerRow

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

                const tileset = {
                  size: 256,
                  tileSize: 32,
                }

                const scale = tileSize / tileset.tileSize

                const bgTileSize = tileset.tileSize * scale
                const bgSize = scale * tileset.size

                let textureX = 0
                let textureY = 0

                const tileValue = getTileValue(level, { x: col, y: row })
                if (tileValue === tileTypes.floor) {
                  bgColor = "bg-gray-100"
                  borderColor = "border-gray-300"
                  textureX = 3
                  textureY = 2
                } else if (tileValue === tileTypes.wall) {
                  bgColor = "bg-gray-700"
                  borderColor = "border-gray-700"
                  textureX = 3
                  textureY = 0
                }

                const backgroundX = textureX * bgTileSize * -1
                const backgroundY = textureY * bgTileSize * -1
                const backgroundPosition = `${backgroundX}px ${backgroundY}px`

                return (
                  <div 
                    className={`relative flex items-center justify-center ${borderColor} ${bgColor} aspect-square`}
                    style={{ 
                      width: `${tileSize}px`,
                      backgroundImage: `url(${tilesetImage})`,
                      backgroundSize: `${bgSize}px ${bgSize}px`,
                      backgroundPosition,
                    }}
                    key={`col-${index}`}
                  />
                )
              })}
            </div>
          )
        })}
        {level.goals.map((goalPosition, index) => {
          const mapPosition = getPosition(goalPosition, tileSize, tileSize)

          return (
            <div
              className="absolute p-1"
              key={`goal-${index}`}
              style={{
                width: `${tileSize}px`,
                height: `${tileSize}px`,
                left: `${mapPosition.x}px`,
                top: `${mapPosition.y}px`,
              }}
            >
              <img src={gateIcon} />
            </div>
          )
        })}
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
        <div
          className={classnames("absolute border-t border-b border-blue-600/80 transition-opacity", {
            "opacity-0": !state.teleportBeam.visible,
            "opacity-100": state.teleportBeam.visible,
          })}
          style={{
            borderTopWidth: 12,
            left: state.teleportBeam.position.x,
            top: state.teleportBeam.position.y,
            transformOrigin: "left center",
            transform: `translate(0%, -50%) rotate(${state.teleportBeam.rotation}deg)`,
            width: `${state.teleportBeam.width}px`,
          }}
        ></div>
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
        {state.players.map((player, index) => {
          const playerPosition = getPosition(player.position, playerSize, playerSize)

          const isActive = index === state.activePlayerIndex

          return (
            <div 
              key={`player-${index}`}
              className={classnames("absolute aspect-square rounded-full transition-all", {
                "brightness-50": !isActive,
                "bg-red-600": player.type === playerTypes.warrior,
                "bg-green-600": player.type === playerTypes.thief,
                "bg-blue-600": player.type === playerTypes.wizard,
              })}
              style={{
                width: `${playerSize}px`,
                left: `${playerPosition.x}px`,
                top: `${playerPosition.y}px`,
              }}
            />
          )
        })}
      </div>
      {state.popup.visible && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-10 py-14 border-2 border-white bg-gray-900 text-white rounded-lg shadow-md">
          <p className="text-24 text-center" dangerouslySetInnerHTML={{ __html: state.popup.message }}></p>
          <p className="mt-10 text-18 text-center">Press "X" to Continue</p>
        </div>
      )}
    </>
  )
}

createRoot(document.getElementById("app")).render(<App />)