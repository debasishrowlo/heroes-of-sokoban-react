import {
  directions,
  entityTypes, 
  eventTypes, 
  gameStatuses,
  colors,
  heroStates,
  heroTypes, 
} from "./constants"

export type BlockDestroyEvent = {
  type: eventTypes.destroy,
  entity: {
    type: entityTypes.block,
    index: number,
    position: V2,
  },
}

export type HeroDestroyEvent = {
  type: eventTypes.destroy,
  entity: {
    type: entityTypes.block | entityTypes.hero,
    index: number,
    position: V2,
    heroType: heroTypes,
    direction: directions.left | directions.right,
    currentActiveHeroIndex: number,
    nextActiveHeroIndex: number,
  },
}

export type DestroyEvent = BlockDestroyEvent | HeroDestroyEvent

export type Entity = (
  GateEntity
  | HeroEntity
  | BlockEntity
  | WallEntity
)

// TODO: Rename to GameEvent because it overlaps with the default Event property
export type Event = MoveEvent | SwitchHeroEvent | DestroyEvent

export type GateEntity = {
  type: entityTypes.gate,
  index: number,
}

export type HeroEntity = {
  type: entityTypes.hero,
  index: number,
}

export type Level = {
  textures: {
    surfaces: number[],
    shadows: number[],
  },
  popupMessage?: string,
  tilemap: Tilemap,
  tilesPerRow: number,
  heroes: Array<{
    type: heroTypes,
    position: V2,
  }>,
  goals: V2[],
  blocks?: V2[],
  gates?: Gate[],
  switches?: Switch[],
}

export type MovableEntity = HeroEntity | BlockEntity

export type MoveEvent = {
  type: eventTypes.move,
  entity: MovableEntity,
  from: V2,
  to: V2,
}

export type BlockEntity = {
  type: entityTypes.block,
  index: number,
}

export type TeleportBeam = {
  visible: boolean,
  width: number,
  position: V2,
  rotation: number,
}

export type Block = V2

export type Hero = {
  type: heroTypes,
  position: V2,
  direction: directions.left | directions.right,
  state: heroStates,
}

export type State = {
  levelIndex: number,
  tilesPerRow: number,
  gameStatus: gameStatuses,
  popup: {
    visible: boolean,
    message: string,
  },
  blocks: Block[],
  gates: Gate[],
  switches: Array<{
    position: V2,
    color: colors,
  }>,
  teleportBeam: TeleportBeam,
  heroes: Hero[],
  activeHeroIndex: number,
  margin: {
    left: number,
    top: number,
  },
  turns: Turn[],
}

export type Gate = {
  position: V2,
  color: colors,
  switchIndices: number[],
}

export type Switch = {
  color: colors,
  position: V2,
}

export type SwitchHeroEvent = {
  type: eventTypes.switchHero,
  previousActiveHeroIndex: number,
  nextActiveHeroIndex: number,
}

export type Tilemap = number[]

export type Turn = Event[]

export type WallEntity = {
  type: entityTypes.wall,
}

export type V2 = {
  x: number,
  y: number,
}