import React, { useEffect } from "react"
import classnames from "classnames"

import {
  Block,
  BlockDestroyEvent,
  BlockEntity,
  DestroyEvent,
  Entity,
  Event,
  Gate,
  Hero,
  HeroDestroyEvent,
  HeroEntity,
  Level,
  MovableEntity,
  MoveEvent,
  State,
  Switch,
  SwitchHeroEvent,
  TeleportBeam,
  V2, 
} from "./types"
import levels from "./levels"
import {
  colors, 
  directions,
  entityTypes,
  eventTypes,
  gameStatuses,
  heroHeight,
  heroStates, 
  heroTypes, 
  heroWalkDuration,
  heroWidth, 
  playerTileset, 
  tileset, 
  tileSize, 
  tileTypes,
} from "./constants"
import {
  getNextTileInDirection,
  getRows,
  getTilePositionFromIndex,
  getTileValue,
  getValueFromPosition,
  getWorldPosition,
} from "./lib/tilemap"
import { v2Equal } from "./lib/v2"

const getColor = (colorType:colors) => {
  const colorObj = {
    [colors.yellow]: "#f7e26b",
    [colors.purple]: "#621fc3",
  }

  return colorObj[colorType]
}

const Popup = ({
  message,
} : {
  message: string,
}) => {
  return (
    <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-10 py-14 border-2 border-white bg-gray-900 text-white rounded-lg shadow-md">
      <p className="text-24 text-center" dangerouslySetInnerHTML={{ __html: message }}></p>
      <p className="mt-10 text-18 text-center">Press <span className="text-yellow-400">X</span> to Continue</p>
    </div>
  )
}

const Tiles = ({
  level,
} : {
  level: Level,
}) => {
  const rows = getRows(level)
  const cols = level.tilesPerRow

  return (
    <>
      {Array.from(Array(rows).keys()).map((row, index) => {
        return (
          <div className="flex" key={`row-${index}`}>
            {Array.from(Array(cols).keys()).map((col, index) => {
              const scale = tileSize / tileset.tileSize
              const bgTileSize = tileset.tileSize * scale
              const bgSize = {
                x: scale * tileset.width,
                y: scale * tileset.height,
              }

              let surfaceTextureIndex = null

              if (level.textures) {
                surfaceTextureIndex = getValueFromPosition(level.textures.surfaces, { x: col, y: row }, level.tilesPerRow) - 1
              } else {
                const tileValue = getTileValue(level, { x: col, y: row })

                const wallSurfaceIndex = 14
                const floorSurfaceIndex = 5

                const tileIsWall = tileValue === tileTypes.wall
                surfaceTextureIndex = tileIsWall ? wallSurfaceIndex : floorSurfaceIndex
              }

              const surfaceTexturePosition = getTilePositionFromIndex(surfaceTextureIndex, tileset.texturesPerRow)
              const surfaceBackgroundX = surfaceTexturePosition.x * bgTileSize * -1
              const surfaceBackgroundY = surfaceTexturePosition.y * bgTileSize * -1

              return (
                <div 
                  className={`relative flex items-center justify-center text-white aspect-square`}
                  style={{
                    width: `${tileSize}px`,
                    fontSize: 10,
                  }}
                  key={`col-${index}`}
                >
                  <div 
                    className="absolute w-full h-full flex items-center justify-center"
                    style={{
                      backgroundImage: `url(${tileset.img})`,
                      backgroundSize: `${bgSize.x}px ${bgSize.y}px`,
                      backgroundPosition: `${surfaceBackgroundX}px ${surfaceBackgroundY}px`,
                    }}
                  >
                    {/* <span className="block">{col},{row}</span> */}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </>
  )
}

const Goals = ({
  level,
} : {
  level: Level,
}) => {
  return (
    <>
      {level.goals.map((goalPosition, index) => {
        const mapPosition = getWorldPosition(goalPosition, tileSize, tileSize, tileSize)

        const scale = tileSize / tileset.tileSize
        const bgTileSize = tileset.tileSize * scale
        const bgSize = {
          x: scale * tileset.width,
          y: scale * tileset.height,
        }

        const goalTextureIndex = 9
        const texturePosition = getTilePositionFromIndex(goalTextureIndex, tileset.texturesPerRow)

        const backgroundX = texturePosition.x * bgTileSize * -1
        const backgroundY = texturePosition.y * bgTileSize * -1

        return (
          <div
            className="absolute"
            key={`goal-${index}`}
            style={{
              width: `${tileSize}px`,
              height: `${tileSize}px`,
              left: `${mapPosition.x}px`,
              top: `${mapPosition.y}px`,
            }}
          >
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `url(${tileset.img})`,
                backgroundSize: `${bgSize.x}px ${bgSize.y}px`,
                backgroundPosition: `${backgroundX}px ${backgroundY}px`,
              }}
            >
            </div>
          </div>
        )
      })}
    </>
  )
}

const Gates = ({
  gates,
  isGateOpen,
} : {
  gates: Gate[],
  isGateOpen: (gateIndex:number) => boolean,
}) => {
  return (
    <>
      {gates.map((gate:Gate, index:number) => {
        const size = tileSize
        const position = getWorldPosition(gate.position, size, size, tileSize)

        const isOpen = isGateOpen(index)
        const highlightSize = size / 5

        const gateColor:string = getColor(gate.color)

        return (
          <div key={`gate-${index}`}>
            <div
              className="absolute aspect-square transition-all"
              style={{
                width: `${size}px`,
                left: `${position.x}px`,
                top: `${position.y}px`,
                backgroundColor: isOpen ? "transparent" : gateColor,
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
                      backgroundColor: gateColor,
                      width: `${highlightSize}px`,
                      left: `${left}px`,
                      top: `${top}px`,
                    }}
                  ></div>
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}

const Switches = ({
  switches,
} : {
  switches: Switch[],
}) => {
  return (
    <>
      {switches.map((gateSwitch, index) => {
        const size = tileSize / 3
        const position = getWorldPosition(gateSwitch.position, size, size, tileSize)

        const color:string = getColor(gateSwitch.color)

        return (
          <div 
            className="w-10 aspect-square absolute border border-gray-400"
            key={`switch-${index}`}
            style={{
              width: `${size}px`,
              left: `${position.x}px`,
              top: `${position.y}px`,
              backgroundColor: color,
            }}
          >
          </div>
        )
      })}
    </>
  )
}

const TeleportBeam = ({
  teleportBeam,
} : {
  teleportBeam: TeleportBeam,
}) => {
  return (
    <div
      className={classnames("absolute border-t border-b border-blue-600/80 transition-opacity", {
        "opacity-0": !teleportBeam.visible,
        "opacity-100": teleportBeam.visible,
      })}
      style={{
        borderTopWidth: 12,
        left: teleportBeam.position.x,
        top: teleportBeam.position.y,
        transformOrigin: "left center",
        transform: `translate(0%, -50%) rotate(${teleportBeam.rotation}deg)`,
        width: `${teleportBeam.width}px`,
      }}
    ></div>
  )
}

const Blocks = ({
  blocks,
} : {
  blocks: Block[],
}) => {
  return (
    <>
      {blocks.map((blockPosition, index) => {
        const position = getWorldPosition(blockPosition, tileSize, tileSize, tileSize)

        const scale = tileSize / tileset.tileSize
        const bgTileSize = tileset.tileSize * scale
        const bgSize = {
          x: scale * tileset.width,
          y: scale * tileset.height,
        }

        const blockTextureIndex = 19
        const texturePosition = getTilePositionFromIndex(blockTextureIndex, tileset.texturesPerRow)

        const backgroundX = texturePosition.x * bgTileSize * -1
        const backgroundY = texturePosition.y * bgTileSize * -1
        const backgroundPosition = `${backgroundX}px ${backgroundY}px`

        return (
          <div 
            className="absolute flex items-center justify-center transition-all"
            key={`block-${index}`}
            style={{
              width: `${tileSize}px`,
              height: `${tileSize}px`,
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          >
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `url(${tileset.img})`,
                backgroundSize: `${bgSize.x}px ${bgSize.y}px`,
                backgroundPosition,
              }}
            >
            </div>
          </div>
        )
      })}
    </>
  )
}

const Shadows = ({
  level,
} : {
  level: Level,
}) => {
  const rows = getRows(level)
  const cols = level.tilesPerRow

  return (
    <>
      {Array.from(Array(rows).keys()).map((row, index) => {
        return (
          <div className="w-full h-full flex absolute top-0 left-0" key={`row-${index}`}>
            {Array.from(Array(cols).keys()).map((col, index) => {
              const shadowTextureIndex = getValueFromPosition(level.textures.shadows, { x: col, y: row }, level.tilesPerRow) - 1
              const tileHasShadow = shadowTextureIndex !== -1

              if (!tileHasShadow) {
                return null
              }

              const scale = tileSize / tileset.tileSize
              const bgTileSize = tileset.tileSize * scale
              const bgSize = {
                x: scale * tileset.width,
                y: scale * tileset.height,
              }

              const shadowTexturePosition = getTilePositionFromIndex(shadowTextureIndex, tileset.texturesPerRow)
              const shadowBackgroundX = shadowTexturePosition.x * bgTileSize * -1
              const shadowBackgroundY = shadowTexturePosition.y * bgTileSize * -1

              const tilePosition = getWorldPosition({ x: col, y: row }, tileSize, tileSize, tileSize)

              return (
                <div
                  className="absolute aspect-square"
                  id="shadow"
                  style={{
                    width: `${tileSize}px`,
                    top: `${tilePosition.y}px`,
                    left: `${tilePosition.x}px`,
                    backgroundImage: `url(${tileset.img})`,
                    backgroundSize: `${bgSize.x}px ${bgSize.y}px`,
                    backgroundPosition: `${shadowBackgroundX}px ${shadowBackgroundY}px`,
                  }}
                  key={`col-${index}`}
                ></div>
              )
            })}
          </div>
        )
      })}
    </>
  )
}

const Heroes = ({
  heroes,
  activeHeroIndex,
} : {
  heroes: Hero[],
  activeHeroIndex: number,
}) => {
  return (
    <>
      {heroes.map((hero, index) => {
        const heroPosition = {
          x: (hero.position.x * tileSize) + (tileSize / 2) - (heroWidth / 2),
          y: (hero.position.y * tileSize) - tileSize,
        }
        const isActive = index === activeHeroIndex

        let playerTextureIndex = null
        if (hero.type === heroTypes.warrior) {
          playerTextureIndex = 0
        } else if (hero.type === heroTypes.thief) {
          playerTextureIndex = 12
        } else if (hero.type === heroTypes.wizard) {
          playerTextureIndex = 24
        }

        const tileset = playerTileset
        const scale = tileSize / tileset.tileSize
        const bgTileSize = tileset.tileSize * scale
        const bgSize = {
          x: scale * tileset.width,
          y: scale * tileset.height,
        }

        const texturePosition = getTilePositionFromIndex(playerTextureIndex, tileset.texturesPerRow, 2)
        const backgroundX = texturePosition.x * bgTileSize * -1
        const backgroundY = texturePosition.y * bgTileSize * -1

        const zIndex = 5 + hero.position.y

        let animation = ""

        if (isActive) {
          if (hero.type === heroTypes.warrior) {
            if (hero.state === heroStates.idle) {
              animation = "warrior__idle"
            } else if (hero.state === heroStates.walking) {
              animation = "warrior__walk"
            }
          } else if (hero.type === heroTypes.thief) {
            animation = "thief__idle"
          } else if (hero.type === heroTypes.wizard) {
            animation = "wizard__idle"
          }
        }

        return (
          <div
            key={`hero-${index}`}
            className={classnames(`absolute rounded-full transition-all`, {
              "brightness-50": !isActive,
            })}
            style={{
              width: `${heroWidth}px`,
              height: `${heroHeight}px`,
              left: `${heroPosition.x}px`,
              top: `${heroPosition.y}px`,
              transitionDuration: `${heroWalkDuration}ms`,
              zIndex,
            }}
          >
            <div 
              className={classnames(`${animation} w-full h-full`, {
                "-scale-x-100": hero.direction === directions.left,
              })}
              style={{
                backgroundImage: `url(${tileset.img})`,
                backgroundSize: `${bgSize.x}px ${bgSize.y}px`,
                backgroundPosition: `${backgroundX}px ${backgroundY}px`,
              }}
            >
            </div>
          </div>
        )
      })}
    </>
  )
}

const getCurrentLevel = (state:State) => {
  return levels[state.levelIndex]
}

const isGamePaused = (state:State) => {
  return state.gameStatus === gameStatuses.paused
}

const isGameOver = (state:State) => {
  return state.gameStatus === gameStatuses.win
}

const isInvalidKeyPressed = (e:KeyboardEvent) => {
  const supportedKeys = [
    "x", "X",
    "r", "R",
    "z", "Z",
    "w", "W",
    "a", "A",
    "s", "S",
    "d", "D",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
  ]
  
  return !supportedKeys.includes(e.key)
}

const getDirection = (e:KeyboardEvent):directions => {
  const key = e.key

  const upKeyPressed = (
    key === "ArrowUp" || 
    key.toLowerCase() === "w"
  )
  if (upKeyPressed) { return directions.up }

  const downKeyPressed = (
    key === "ArrowDown" || 
    key.toLowerCase() === "s"
  )
  if (downKeyPressed) { return directions.down }

  const leftKeyPressed = (
    key === "ArrowLeft" || 
    key.toLowerCase() === "a"
  )
  if (leftKeyPressed) { return directions.left }

  return directions.right
}

const simulate = (state:State, events:Event[]) => {
  events.forEach(event => {
    simulateEvent(state, event)

    const destroyEvents = findDestroyEvents(state)
    destroyEvents.forEach(event => {
      simulateEvent(state, event)
    })

    saveEventsToHistory(state, [
      ...events,
      ...destroyEvents,
    ])
  })
}

const handleWarriorMove = (state:State, events:Event[], direction:directions) => {
  const level = getCurrentLevel(state)
  const rows = getRows(level)
  const cols = level.tilesPerRow
  const hero = state.heroes[state.activeHeroIndex]

  let entitiesToBeMoved:Array<Entity> = [
    {
      type: entityTypes.hero,
      index: state.activeHeroIndex,
    },
  ]

  let nextPosition = getNextTileInDirection(hero.position, direction, rows, cols)
  while (true) {
    const entityOnTile = getEntityOnTile(state, level, nextPosition)

    const tileIsEmpty = entityOnTile === null
    if (tileIsEmpty) { break }

    const tileContainsGate = entityOnTile.type === entityTypes.gate
    const tileGateOpen = tileContainsGate ? isGateOpen(state, entityOnTile.index) : false
    const tileContainsOpenGate = tileContainsGate && tileGateOpen
    if (tileContainsOpenGate) { break }

    const tileContainsWall = entityOnTile.type === entityTypes.wall
    const tileContainsClosedGate = tileContainsGate && !tileGateOpen
    const tileContainsImmovableEntity = tileContainsWall || tileContainsClosedGate
    if (tileContainsImmovableEntity) {
      entitiesToBeMoved = []
      break
    } 

    if (tileContainsMovableEntity(entityOnTile)) {
      entitiesToBeMoved = [...entitiesToBeMoved, entityOnTile]
    }

    nextPosition = getNextTileInDirection(nextPosition, direction, rows, cols)
  }
  
  for (let i = 0; i < entitiesToBeMoved.length; i++) {
    const entity = entitiesToBeMoved[i]

    const tileContainsHero = entity.type === entityTypes.hero
    const tileContainsBlock = entity.type === entityTypes.block

    if (tileContainsHero) {
      const hero = state.heroes[entity.index]
      const nextPosition = getNextTileInDirection(hero.position, direction, rows, cols)
      events.push(createMoveEvent(entity, hero.position, nextPosition))
    } else if (tileContainsBlock) {
      const blockPosition = state.blocks[entity.index]
      const nextPosition = getNextTileInDirection(blockPosition, direction, rows, cols)
      events.push(createMoveEvent(entity, blockPosition, nextPosition))
    }
  }
}

const handleThiefMove = (state:State, events:Event[], direction:directions) => {
  const level = getCurrentLevel(state)
  const rows = getRows(level)
  const cols = level.tilesPerRow
  const hero = state.heroes[state.activeHeroIndex]

  const nextPosition = getNextTileInDirection(hero.position, direction, rows, cols)
  const entityOnTile = getEntityOnTile(state, level, nextPosition)

  const tileIsEmpty = entityOnTile === null
  const tileContainsGate = entityOnTile && entityOnTile.type === entityTypes.gate
  const tileContainsOpenGate = tileContainsGate && isGateOpen(state, entityOnTile.index)
  const tileCanBeOccupied = tileIsEmpty || tileContainsOpenGate
  if (tileCanBeOccupied) {
    const currentPosition = state.heroes[state.activeHeroIndex].position

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

    const oppositePosition = getNextTileInDirection(currentPosition, oppositeDirection, rows, cols)
    const entityOnOppositeTile = getEntityOnTile(state, level, oppositePosition)

    const oppositeTileContainsBlock = entityOnOppositeTile && entityOnOppositeTile.type === entityTypes.block
    if (oppositeTileContainsBlock) {
      const blockPosition = state.blocks[entityOnOppositeTile.index]
      events.push(createMoveEvent(entityOnOppositeTile, blockPosition, currentPosition))
    }

    const oppositeTileContainsHero = entityOnOppositeTile && entityOnOppositeTile.type === entityTypes.hero
    if (oppositeTileContainsHero) {
      const heroPosition = state.heroes[entityOnOppositeTile.index].position
      events.push(createMoveEvent(entityOnOppositeTile, heroPosition, currentPosition))
    }

    const heroPosition = state.heroes[state.activeHeroIndex].position
    const heroEntity:HeroEntity = { type: entityTypes.hero, index: state.activeHeroIndex }
    events.push(createMoveEvent(heroEntity, heroPosition, nextPosition))
  }
}

const saveEventsToHistory = (state:State, events: Event[]) => {
  state.turns.push(events)
}

const findDestroyEvents = (state:State):DestroyEvent[] => {
  const destroyEvents:DestroyEvent[] = []

  const closedGatePositions:V2[] = []
  state.gates.forEach((gate, gateIndex) => {
    if (!isGateOpen(state, gateIndex)) {
      closedGatePositions.push({ ...gate.position })
    }
  })
  closedGatePositions.forEach((gatePosition) => {
    state.blocks.forEach((blockPosition, blockIndex) => {
      if (v2Equal(blockPosition, gatePosition)) {
        destroyEvents.push({
          type: eventTypes.destroy,
          entity: {
            type: entityTypes.block,
            index: blockIndex,
            position: { ...blockPosition },
          },
        })
      }
    })
    state.heroes.forEach((hero, heroIndex) => {
      if (v2Equal(hero.position, gatePosition)) {
        destroyEvents.push({
          type: eventTypes.destroy,
          entity: {
            type: entityTypes.hero,
            index: heroIndex,
            position: { ...hero.position },
            heroType: hero.type,
            direction: hero.direction,
            currentActiveHeroIndex: state.activeHeroIndex,
            nextActiveHeroIndex: Math.max(state.activeHeroIndex - 1, 0),
          },
        })
      }
    })
  })

  return destroyEvents
}

const isCurrentLevelCleared = (state:State) => {
  const currentLevel = getCurrentLevel(state)
  const allGoalsOccupiedByHeroes = currentLevel.goals.every((goalPosition) => {
    const occupiedByHero = state.heroes.some(hero => v2Equal(hero.position, goalPosition))
    return occupiedByHero
  })
  const levelCleared = allGoalsOccupiedByHeroes
  return levelCleared
}

const pauseGame = (state:State) => {
  state.gameStatus = gameStatuses.paused
}

const nextLevelAvailable = (state:State) => {
  const nextLevelIndex = state.levelIndex + 1
  const nextLevelAvailable = nextLevelIndex < levels.length
  return nextLevelAvailable
}

const getActiveHero = (state:State):Hero => {
  return state.heroes[state.activeHeroIndex]
}

const isGateOpen = (state:State, gateIndex:number):boolean => {
  const gate = state.gates[gateIndex]

  const allSwitchesPressed = state.switches
    .filter((_, index) => {
      return gate.switchIndices.includes(index)
    })
    .every(gateSwitch => {
      const isHeroOnSwitch = state.heroes.some(hero => {
        return v2Equal(gateSwitch.position, hero.position)
      })

      const isBlockOnSwitch = state.blocks.some(
        blockPosition => v2Equal(blockPosition, gateSwitch.position)
      )

      return isHeroOnSwitch || isBlockOnSwitch
    })

  const isOpen = allSwitchesPressed

  return isOpen
}

const getEntityOnTile = (state:State, level:Level, position:V2):Entity|null => {
  const blockIndex = state.blocks.findIndex(blockPosition => v2Equal(blockPosition, position))
  if (blockIndex !== -1) {
    return {
      type: entityTypes.block,
      index: blockIndex,
    }
  }

  const heroIndex = state.heroes.findIndex(hero => v2Equal(hero.position, position))
  if (heroIndex !== -1) {
    return {
      type: entityTypes.hero,
      index: heroIndex,
    }
  }

  const gateIndex = state.gates.findIndex(gate => v2Equal(gate.position, position))
  if (gateIndex !== -1) {
    return {
      type: entityTypes.gate,
      index: gateIndex,
    }
  }

  const tileValue = getTileValue(level, position)
  if (tileValue === tileTypes.wall) {
    return {
      type: entityTypes.wall,
    }
  }

  return null
}

const createMoveEvent = (entity:MovableEntity, from:V2, to:V2):MoveEvent => {
  return {
    type: eventTypes.move,
    entity,
    from: { ...from },
    to: { ...to },
  }
}

const tileContainsImmovableEntity = (state:State, entity:Entity):boolean => {
  const tileContainsWall = entity.type === entityTypes.wall
  const tileContainsGate = entity.type === entityTypes.gate
  const tileContainsClosedGate = tileContainsGate && !isGateOpen(state, entity.index)
  const tileContainsImmovableEntity = tileContainsWall || tileContainsClosedGate
  return tileContainsImmovableEntity
}

const tileContainsMovableEntity = (entity:Entity):boolean => {
  const tileContainsBlock = entity.type === entityTypes.block
  const tileContainsHero = entity.type === entityTypes.hero
  return tileContainsBlock || tileContainsHero
}

const pauseTransitions = (duration:number) => {
  document.documentElement.classList.add("disable-transitions")
  setTimeout(() => {
    document.documentElement.classList.remove("disable-transitions")
  }, duration)
}

const moveHero = (
  state:State, 
  heroIndex:number, 
  newPosition:V2
)=> {
  const hero = state.heroes[heroIndex]
  let direction = hero.direction 
  
  if (newPosition.x < hero.position.x) {
    direction = directions.left
  } else if (newPosition.x > hero.position.x) {
    direction = directions.right
  }

  state.heroes[heroIndex].position = newPosition
  state.heroes[heroIndex].direction = direction
}

const moveBlock = (state:State, blockIndex:number, position:V2) => {
  state.blocks[blockIndex] = position
}

const simulateEvent = (state:State, event:Event) => {
  if (event.type === eventTypes.move) {
    event = event as MoveEvent

    if (event.entity.type === entityTypes.hero) {
      moveHero(state, event.entity.index, event.to)
    }

    if (event.entity.type === entityTypes.block) {
      moveBlock(state, event.entity.index, event.to)
    }
  } else if (event.type === eventTypes.switchHero) {
    event = event as SwitchHeroEvent
    state.activeHeroIndex = event.nextActiveHeroIndex
  } else if (event.type === eventTypes.destroy) {
    event = event as DestroyEvent

    if (event.entity.type === entityTypes.block) {
      event = event as BlockDestroyEvent
      state.blocks.splice(event.entity.index, 1)
    } else if (event.entity.type === entityTypes.hero) {
      event = event as HeroDestroyEvent
      state.heroes.splice(event.entity.index, 1)
    }
  }
}

const isPopupVisible = (state:State) => {
  return state.popup.visible
}

const isXKeyPressed = (e:KeyboardEvent) => {
  return e.key.toLowerCase() === "x"
}

const isUndoButtonPressed = (e:KeyboardEvent) => {
  return e.key.toLowerCase() === "z"
}

const isResetButtonPressed = (e:KeyboardEvent) => {
  return e.key.toLowerCase() === "r"
}

const isSwitchHeroButtonPressed = (e:KeyboardEvent) => {
  return isXKeyPressed(e)
}

const Game = ({
  state,
  setState,
  loadLevel,
} : {
  state: State,
  setState: React.Dispatch<React.SetStateAction<State>>,
  loadLevel: (index:number) => void,
}) => {
  const handleKeyDown = (e:KeyboardEvent) => {
    // TODO: (BUG) continue not working after all levels are cleared. Move game over condition to the GameOverScreen component
    if (isGameOver(state)) {
      handleGameOverKeyDown(e)
      return
    }

    if (
      isInvalidKeyPressed(e) ||
      isGamePaused(state)
    ) {
      return
    }

    if (isPopupVisible(state)) {
      handlePopupVisibleKeyDown(e)
      return
    }

    handleGameKeyDown(e, state)
  }

  const hidePopup = () => {
    setState({
      ...state,
      popup: {
        ...state.popup,
        visible: false,
      },
    })
  }

  const handleMove = (e:KeyboardEvent, oldState:State) => {
    const state:State = structuredClone(oldState)
    const events:Event[] = []

    const hero = getActiveHero(state)
    const direction = getDirection(e)

    if (hero.type === heroTypes.warrior) {
      handleWarriorMove(state, events, direction)
    } else if (hero.type === heroTypes.thief) {
      handleThiefMove(state, events, direction)
    } else if (hero.type === heroTypes.wizard) {
      handleWizardMove(state, events, direction)
    }

    const movePerformed = events.length > 0
    if (movePerformed) {
      commitMove(state, events)
    }
  }

  const loadNextLevel = (state:State) => {
    const nextLevelIndex = state.levelIndex + 1

    setTimeout(() => {
      state.gameStatus = gameStatuses.loading
      pauseTransitions(150)
      loadLevel(nextLevelIndex)
    }, 500)
  }

  const showGameOverScreen = (state:State) => {
    setTimeout(() => {
      setState({ ...state, gameStatus: gameStatuses.win })
    }, 500)
  }

  const flashTeleportBeam = (state:State) => {
    setTimeout(() => {
      setState(state => {
        return {
          ...state,
          teleportBeam: {
            ...state.teleportBeam, 
            visible: false,
          },
        }
      })
    }, 150)
  }

  const commitMove = (state:State, events:Event[]) => {
    simulate(state, events)
    checkWinCondition(state)
    setState(state)
  }

  const handlePopupVisibleKeyDown = (e:KeyboardEvent) => {
    if (isXKeyPressed(e)) {
      hidePopup()
    }
  }

  const handleGameOverKeyDown = (e:KeyboardEvent) => {
    if (isXKeyPressed(e)) {
      showLevelSelect()
    }
  }

  const checkWinCondition = (state:State) => {
    if (isCurrentLevelCleared(state)) {
      pauseGame(state)

      if (nextLevelAvailable(state)) {
        loadNextLevel(state)
      } else {
        showGameOverScreen(state)
      }
    }
  }

  const handleWizardMove = (state:State, events:Event[], direction:directions) => {
    const level = getCurrentLevel(state)
    const rows = getRows(level)
    const cols = level.tilesPerRow
    const hero = state.heroes[state.activeHeroIndex]

    let entity:MovableEntity = null

    let currentPosition = getNextTileInDirection(hero.position, direction, rows, cols)
    while(true) {
      const entityOnTile = getEntityOnTile(state, level, currentPosition)

      if (entityOnTile) {
        if (tileContainsImmovableEntity(state, entityOnTile)) { break }

        if (tileContainsMovableEntity(entityOnTile)) {
          entity = entityOnTile as MovableEntity
          break
        }
      }

      currentPosition = getNextTileInDirection(currentPosition, direction, rows, cols)
    }

    const entityToSwap = entity

    if (entityToSwap !== null) {
      let startPosition:V2|null = null
      let endPosition:V2|null = null

      const tileContainsBlock = entityToSwap.type === entityTypes.block
      const tileContainsHero = entityToSwap.type === entityTypes.hero

      if (tileContainsBlock) {
        const heroIndex = state.activeHeroIndex
        const heroPosition = { ...hero.position }

        const blockIndex = entityToSwap.index
        const blockPosition = state.blocks[blockIndex]

        const heroEntity:HeroEntity = { type: entityTypes.hero, index: heroIndex }
        const blockEntity:BlockEntity = { type: entityTypes.block, index: blockIndex }
        events.push(createMoveEvent(heroEntity, heroPosition, blockPosition))
        events.push(createMoveEvent(blockEntity, blockPosition, heroPosition))

        if (heroPosition.x < blockPosition.x) {
          startPosition = { ...heroPosition }
          endPosition = { ...blockPosition }
        } else {
          startPosition = { ...blockPosition }
          endPosition = { ...heroPosition }
        }
      } else if (tileContainsHero) {
        const wizardIndex = state.activeHeroIndex
        const wizardPosition = { ...hero.position }

        const heroIndex = entityToSwap.index
        const heroPosition = state.heroes[heroIndex].position

        const wizardEntity:HeroEntity = { type: entityTypes.hero, index: wizardIndex }
        const heroEntity:HeroEntity = { type: entityTypes.hero, index: heroIndex }
        events.push(createMoveEvent(wizardEntity, wizardPosition, heroPosition))
        events.push(createMoveEvent(heroEntity, heroPosition, wizardPosition))

        if (wizardPosition.x < heroPosition.x) {
          startPosition = { ...wizardPosition }
          endPosition = { ...heroPosition }
        } else {
          startPosition = { ...heroPosition }
          endPosition = { ...wizardPosition }
        }
      }

      const teleportBeam = {
        visible: true,
        width: 0,
        position: {
          x: 0,
          y: 0,
        },
        rotation: 0,
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

      state.teleportBeam = teleportBeam
    } else {
      const nextPosition = getNextTileInDirection(hero.position, direction, rows, cols)
      const entityOnTile = getEntityOnTile(state, level, nextPosition)

      const tileIsEmpty = entityOnTile === null

      if (tileIsEmpty || !tileContainsImmovableEntity(state, entityOnTile)) {
        const heroEntity:HeroEntity = {
          type: entityTypes.hero,
          index: state.activeHeroIndex,
        }
        const currentPosition = { ...hero.position }
        events.push(createMoveEvent(heroEntity, currentPosition, nextPosition))
      }
    }

    const teleportBeamVisible = state.teleportBeam.visible
    if (teleportBeamVisible) {
      flashTeleportBeam(state)
    }
  }

  const undoMove = (oldState:State) => {
    const noMovesToUndo = oldState.turns.length === 0
    if (noMovesToUndo) {
      return
    }

    const state = structuredClone(oldState)

    const previousTurnEvents = state.turns[state.turns.length - 1]
    previousTurnEvents.forEach(event => {
      let reversedEvent = null

      if (event.type === eventTypes.move) {
        reversedEvent = {
          ...event,
          from: { ...event.to },
          to: { ...event.from },
        }
        simulateEvent(state, reversedEvent)
      } else if (event.type === eventTypes.switchHero) {
        reversedEvent = {
          ...event,
          previousActiveHeroIndex: event.nextActiveHeroIndex,
          nextActiveHeroIndex: event.previousActiveHeroIndex,
        }
        simulateEvent(state, reversedEvent)
      } else if (event.type === eventTypes.destroy) {
        if (event.entity.type === entityTypes.block) {
          state.blocks.push(event.entity.position)
        } else if (event.entity.type === entityTypes.hero) {
          state.heroes.push({
            type: event.entity.heroType,
            direction: event.entity.direction,
            position: { ...event.entity.position },
            state: heroStates.idle,
          })
          state.activeHeroIndex = event.entity.currentActiveHeroIndex
        }
      }
    })

    state.turns.pop()
    setState(state)
  }

  const switchHero = (oldState:State) => {
    const state:State = structuredClone(oldState)

    const levelHasOneHero = levels[state.levelIndex].heroes.length === 1
    if (levelHasOneHero) {
      return
    }

    const currentActiveHeroIndex = state.activeHeroIndex
    const nextActiveHeroIndex = (state.activeHeroIndex + 1) % state.heroes.length

    const switchHeroEvent:SwitchHeroEvent = {
      type: eventTypes.switchHero,
      previousActiveHeroIndex: currentActiveHeroIndex,
      nextActiveHeroIndex: nextActiveHeroIndex,
    }

    simulateEvent(state, switchHeroEvent)
    state.turns.push([switchHeroEvent])

    setState(state)
  }

  const handleResize = () => {
    if (state && state.gameStatus === gameStatuses.playing) {
      const level = getCurrentLevel(state)
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

  const handleGameKeyDown = (e:KeyboardEvent, state:State) => {
    if (isResetButtonPressed(e)) {
      reloadLevel()
      return
    }

    if (isUndoButtonPressed(e)) {
      undoMove(state)
      return
    }

    if (isSwitchHeroButtonPressed(e)) {
      switchHero(state)
      return
    }
    
    handleMove(e, state)
  }

  const reloadLevel = () => {
    pauseTransitions(150)
    loadLevel(state.levelIndex)
  }

  const showLevelSelect = () => {
    setState(null)
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    window.addEventListener("resize", handleResize)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("resize", handleResize)
    }
  }, [state])

  const level = getCurrentLevel(state)

  return (
    <>
      <div className="px-6 fixed z-50 top-0 right-0">
        <button
          type="button" 
          className="p-4 text-18 text-gray-100"
          onClick={() => showLevelSelect()}
        >
          Levels
        </button>
      </div>
      <div className="px-6 py-4 fixed z-50 top-0 left-0">
        <p className="text-18 text-gray-100">Level - {state.levelIndex + 1}</p>
      </div>
      <div className="px-6 py-4 fixed z-50 bottom-0 left-0">
        <p className="text-18 text-gray-100">Z - Undo Move</p>
        <p className="mt-2 text-18 text-gray-100">R - Reset level</p>
      </div>
      <div
        className="relative"
        style={{
          marginLeft: `${state.margin.left}px`,
          marginTop: `${state.margin.top}px`,
        }}
      >
        <Tiles level={level} />
        <Goals level={level} />
        <Gates
          gates={state.gates}
          isGateOpen={(index:number) => isGateOpen(state, index)}
        />
        <Switches switches={state.switches} />
        <TeleportBeam teleportBeam={state.teleportBeam} /> {/* NOTE: Teleport beam is rendered here because it should not appear on top of the blocks - Deb, 27 Sep 2024 */}
        <Blocks blocks={state.blocks} />
        <Shadows level={level} />
        <Heroes
          heroes={state.heroes}
          activeHeroIndex={state.activeHeroIndex}
        />
      </div>
      {state.popup.visible && (
        <Popup message={state.popup.message} />
      )}
    </>
  )
}

export default Game