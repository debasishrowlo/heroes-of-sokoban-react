import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import classnames from "classnames"

import "./index.css"

import gateIcon from "./assets/gate.png"
import tilesetImg from "./assets/tileset2.png"

const enum entityTypes {
  hero = "hero",
  rock = "rock",
  gate = "gate",
  wall = "wall",
}

const enum eventTypes {
  move = "move",
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

const enum heroTypes {
  warrior = "warrior",
  thief = "thief",
  wizard = "wizard",
}

const enum switchGateColors {
  yellow = "yellow",
  purple = "purple",
}

const enum tileTypes {
  empty = 0,
  floor = 1,
  wall = 2,
}

type Entity = (
  GateEntity
  | HeroEntity
  | RockEntity
  | WallEntity
)

type Event = MoveEvent

type GateEntity = {
  type: entityTypes.gate,
  index: number,
}

type HeroEntity = {
  type: entityTypes.hero,
  index: number,
}

type Level = {
  popupMessage?: string,
  tilemap: Tilemap,
  tilesPerRow: number,
  heroes: Array<{
    type: heroTypes,
    position: V2,
  }>,
  goals: V2[],
  rocks?: V2[],
  switchGates?: SwitchGate[],
}

type MovableEntity = HeroEntity | RockEntity

type MoveEvent = {
  type: eventTypes.move,
  entity: MovableEntity,
  from: V2,
  to: V2,
}

type RockEntity = {
  type: entityTypes.rock,
  index: number,
}

type State = {
  levelIndex: number,
  tilesPerRow: number,
  gameStatus: gameStatuses,
  popup: {
    visible: boolean,
    message: string,
  },
  rocks: V2[],
  switchGates: SwitchGate[],
  teleportBeam: {
    visible: boolean,
    width: number,
    position: V2,
    rotation: number,
  },
  heroes: Array<{
    type: heroTypes,
    position: V2,
  }>,
  activeHeroIndex: number,
  margin: {
    left: number,
    top: number,
  },
  turns: Turn[],
}

type SwitchGate = {
  position: V2,
  color: switchGateColors,
  switches: V2[],
}

type Tilemap = number[]

type Turn = Event[]

type WallEntity = {
  type: entityTypes.wall,
}

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
    heroes: [
      {
        type: heroTypes.warrior,
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
    heroes: [
      {
        type: heroTypes.warrior,
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
        color: switchGateColors.yellow,
        position: { x: 8, y: 3 },
        switches: [
          { x: 6, y: 2 },
        ],
      }
    ],
    heroes: [
      {
        type: heroTypes.warrior,
        position: { x: 2, y: 2, },
      },
    ],
    rocks: [
      { x: 4, y: 2 },
    ],
    goals: [{ x: 10, y: 2 }],
  },
  {
    popupMessage: "Press multiple switches at once",
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
    heroes: [
      {
        type: heroTypes.warrior,
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
        color: switchGateColors.yellow,
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
        color: switchGateColors.yellow,
        position: { x: 8, y: 3 },
        switches: [
          { x: 6, y: 2 },
        ],
      }
    ],
    heroes: [
      {
        type: heroTypes.thief,
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
    heroes: [
      {
        type: heroTypes.thief,
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
        color: switchGateColors.yellow,
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
    heroes: [
      {
        type: heroTypes.thief,
        position: { x: 5, y: 5, },
      },
    ],
    rocks: [
      { x: 3, y: 5 },
    ],
    switchGates: [
      {
        color: switchGateColors.yellow,
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
        color: switchGateColors.yellow,
        position: { x: 8, y: 2 },
        switches: [
          { x: 6, y: 1 },
          { x: 6, y: 2 },
        ],
      }
    ],
    heroes: [
      {
        type: heroTypes.wizard,
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
    heroes: [
      {
        type: heroTypes.wizard,
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
        color: switchGateColors.yellow,
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
    heroes: [
      {
        type: heroTypes.wizard,
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
    heroes: [
      {
        type: heroTypes.warrior,
        position: { x: 2, y: 2, },
      },
      {
        type: heroTypes.wizard,
        position: { x: 2, y: 6, },
      },
    ],
    rocks: [],
    switchGates: [
      {
        color: switchGateColors.yellow,
        position: { x: 8, y: 2 },
        switches: [
          { x: 6, y: 6 },
        ],
      },
      {
        color: switchGateColors.purple,
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
  {
    popupMessage: "Heroes can move each other",
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 2, 1, 1, 2, 2, 1, 1, 1, 2,
      2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 2,
      2, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 11,
    heroes: [
      {
        type: heroTypes.wizard,
        position: { x: 1, y: 4, },
      },
      {
        type: heroTypes.thief,
        position: { x: 4, y: 2, },
      },
    ],
    rocks: [
      { x: 1, y: 1 },
      { x: 6, y: 4 },
      { x: 9, y: 4 },
    ],
    goals: [
      { x: 7, y: 1 },
      { x: 9, y: 1 },
    ],
  },
  {
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 2,
      2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 2,
      2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 11,
    heroes: [
      {
        type: heroTypes.warrior,
        position: { x: 1, y: 1, },
      },
      {
        type: heroTypes.thief,
        position: { x: 1, y: 5, },
      },
    ],
    rocks: [
      { x: 3, y: 1 },
      { x: 7, y: 1 },
      { x: 7, y: 2 },
      { x: 7, y: 3 },
      { x: 9, y: 3 },
      { x: 6, y: 5 },
    ],
    switchGates: [
      {
        color: switchGateColors.yellow,
        position: { x: 7, y: 4 },
        switches: [
          { x: 9, y: 1 },
        ],
      },
    ],
    goals: [
      { x: 8, y: 5 },
      { x: 9, y: 5 },
    ],
  },
  {
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 
      2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 
      2, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 1, 2, 
      2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 
      2, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 1, 2, 
      2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 13,
    heroes: [
      {
        type: heroTypes.thief,
        position: { x: 11, y: 8, },
      },
      {
        type: heroTypes.wizard,
        position: { x: 11, y: 2, },
      },
    ],
    rocks: [
      { x: 1, y: 2 },
    ],
    switchGates: [
      {
        color: switchGateColors.yellow,
        position: { x: 8, y: 5 },
        switches: [
          { x: 6, y: 2 },
        ],
      },
      {
        color: switchGateColors.purple,
        position: { x: 9, y: 5 },
        switches: [
          { x: 6, y: 8 },
        ],
      },
    ],
    goals: [
      { x: 3, y: 5 },
      { x: 11, y: 5 },
    ],
  },
  {
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 
      2, 2, 1, 1, 2, 1, 2, 2, 2, 1, 1, 1, 2, 
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 13,
    heroes: [
      {
        type: heroTypes.warrior,
        position: { x: 5, y: 1, },
      },
      {
        type: heroTypes.wizard,
        position: { x: 5, y: 3, },
      },
    ],
    rocks: [
      { x: 1, y: 2 },
      { x: 7, y: 1, },
    ],
    switchGates: [
      {
        color: switchGateColors.yellow,
        position: { x: 4, y: 2 },
        switches: [
          { x: 10, y: 2 },
        ],
      },
    ],
    goals: [
      { x: 2, y: 1 },
      { x: 2, y: 3 },
    ],
  },
  {
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 1, 2,
      2, 1, 1, 1, 1, 1, 2, 1, 2,
      2, 1, 1, 2, 2, 1, 2, 1, 2,
      2, 1, 1, 2, 1, 1, 2, 1, 2,
      2, 2, 1, 2, 2, 2, 2, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 1, 2, 2, 2, 2, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 9,
    heroes: [
      {
        type: heroTypes.warrior,
        position: { x: 1, y: 3, },
      },
      {
        type: heroTypes.thief,
        position: { x: 2, y: 3, },
      },
      {
        type: heroTypes.wizard,
        position: { x: 3, y: 3, },
      },
    ],
    rocks: [
      { x: 1, y: 1 },
    ],
    switchGates: [
      {
        color: switchGateColors.purple,
        position: { x: 5, y: 3 },
        switches: [
          { x: 2, y: 8 },
        ],
      },
    ],
    goals: [
      { x: 5, y: 4 },
      { x: 4, y: 5 },
      { x: 5, y: 5 },
    ],
  },
  {
    tilemap: [
      2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 7,
    heroes: [
      {
        type: heroTypes.warrior,
        position: { x: 5, y: 1, },
      },
      {
        type: heroTypes.thief,
        position: { x: 5, y: 3, },
      },
      {
        type: heroTypes.wizard,
        position: { x: 5, y: 5, },
      },
    ],
    rocks: [
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 5, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 1, y: 4 },
      { x: 2, y: 4 },
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
      { x: 2, y: 5 },
      { x: 3, y: 5 },
      { x: 4, y: 5 },
    ],
    goals: [
      { x: 1, y: 1 },
      { x: 1, y: 3 },
      { x: 1, y: 5 },
    ],
  },
]

const tileSize = 55
const heroSize = tileSize / 1.5

const imagesToBeLoaded = [
  gateIcon,
  tilesetImg,
]

const createMoveEvent = (entity:MovableEntity, from:V2, to:V2) => {
  return {
    type: eventTypes.move,
    entity,
    from: { ...from },
    to: { ...to },
  }
}

const generateLevel = (index:number):State => {
  const level = levels[index]
  const state:State = {
    turns: [],
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
    heroes: level.heroes.map(hero => ({ ...hero })),
    activeHeroIndex: 0,
    rocks: level.rocks ? level.rocks.map(position => ({ ...position })) : [],
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

const getEntityOnTile = (state:State, level:Level, position:V2):Entity|null => {
  const rockIndex = state.rocks.findIndex(rockPosition => v2Equal(rockPosition, position))
  if (rockIndex !== -1) {
    return {
      type: entityTypes.rock,
      index: rockIndex,
    }
  }

  const gateIndex = state.switchGates.findIndex(gate => v2Equal(gate.position, position))
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

  const heroIndex = state.heroes.findIndex(hero => v2Equal(hero.position, position))
  if (heroIndex !== -1) {
    return {
      type: entityTypes.hero,
      index: heroIndex,
    }
  }

  return null
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

const isGateOpen = (state:State, gateIndex:number):boolean => {
  const gate = state.switchGates[gateIndex]

  const allSwitchesPressed = gate.switches.every(switchPosition => {
    const isHeroOnSwitch = state.heroes.some(hero => {
      return v2Equal(switchPosition, hero.position)
    })

    const isRockOnSwitch = state.rocks.some(
      rockPosition => v2Equal(rockPosition, switchPosition)
    )

    return isHeroOnSwitch || isRockOnSwitch
  })

  const isOpen = allSwitchesPressed

  return isOpen
}

const moveHero = (state:State, heroIndex:number, position:V2):State => {
  return {
    ...state,
    heroes: [
      ...state.heroes.slice(0, heroIndex),
      {
        ...state.heroes[heroIndex],
        position: { ...position },
      },
      ...state.heroes.slice(heroIndex + 1),
    ],
  }
}

const moveRock = (state:State, rockIndex:number, position:V2):State => {
  return {
    ...state,
    rocks: [
      ...state.rocks.slice(0, rockIndex),
      { ...position },
      ...state.rocks.slice(rockIndex + 1),
    ]
  }
}

const pauseTransitions = (duration:number) => {
  document.documentElement.classList.add("disable-transitions")
  setTimeout(() => {
    document.documentElement.classList.remove("disable-transitions")
  }, duration)
}

const tileContainsImmovableEntity = (state:State, entity:Entity):boolean => {
  const tileContainsWall = entity.type === entityTypes.wall
  const tileContainsGate = entity.type === entityTypes.gate
  const tileContainsClosedGate = tileContainsGate && !isGateOpen(state, entity.index)
  const tileContainsImmovableEntity = tileContainsWall || tileContainsClosedGate
  return tileContainsImmovableEntity
}

const tileContainsMovableEntity = (entity:Entity):boolean => {
  const tileContainsRock = entity.type === entityTypes.rock
  const tileContainsHero = entity.type === entityTypes.hero
  return tileContainsRock || tileContainsHero
}

const v2Equal = (p1:V2, p2:V2) => {
  return p1.x === p2.x && p1.y === p2.y
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

    let newState:State = { ...state }

    const zKeyPressed = key === "z" || key === "Z"
    const turnsAvailableToUndo = newState.turns.length > 0
    if (zKeyPressed && turnsAvailableToUndo) {
      const previousTurnEvents = newState.turns[newState.turns.length - 1]

      for (let i = 0; i < previousTurnEvents.length; i++) {
        const event = previousTurnEvents[i]

        if (event.type === eventTypes.move) {
          if (event.entity.type === entityTypes.hero) {
            newState = moveHero(newState, event.entity.index, event.from)
          }

          if (event.entity.type === entityTypes.rock) {
            newState = moveRock(newState, event.entity.index, event.from)
          }
        }
      }

      newState = {
        ...newState,
        turns: newState.turns.slice(0, -1)
      }

      setState({ ...newState })

      return
    }

    const rKeyPressed = key === "r" || key === "R"
    if (rKeyPressed) {
      pauseTransitions(150)
      loadLevel(state.levelIndex)
      return
    }

    if (xKeyPressed(key)) {
      const nextActiveHeroIndex = (state.activeHeroIndex + 1) % state.heroes.length
      setState({
        ...state,
        activeHeroIndex: nextActiveHeroIndex,
      })
      return
    }

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

    const level = levels[newState.levelIndex]
    const rows = getRows(level)
    const cols = level.tilesPerRow
    const hero = newState.heroes[newState.activeHeroIndex]

    const events = []

    if (hero.type === heroTypes.warrior) {
      let entitiesToBeMoved:Array<Entity> = [
        {
          type: entityTypes.hero,
          index: newState.activeHeroIndex,
        },
      ]

      let nextPosition = getNextTileInDirection(hero.position, direction, rows, cols)
      while (true) {
        const entityOnTile = getEntityOnTile(newState, level, nextPosition)

        const tileIsEmpty = entityOnTile === null
        if (tileIsEmpty) { break }

        const tileContainsGate = entityOnTile.type === entityTypes.gate
        const tileGateOpen = tileContainsGate ? isGateOpen(newState, entityOnTile.index) : false
        const tileContainsOpenGate = tileContainsGate && tileGateOpen
        if (tileIsEmpty || tileContainsOpenGate) { break }

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
        const tileContainsRock = entity.type === entityTypes.rock

        if (tileContainsHero) {
          const hero = newState.heroes[entity.index]
          const nextPosition = getNextTileInDirection(hero.position, direction, rows, cols)
          events.push(createMoveEvent(entity, hero.position, nextPosition))
        } else if (tileContainsRock) {
          const rockPosition = newState.rocks[entity.index]
          const nextPosition = getNextTileInDirection(rockPosition, direction, rows, cols)
          events.push(createMoveEvent(entity, rockPosition, nextPosition))
        }
      }
    } else if (hero.type === heroTypes.thief) {
      const nextPosition = getNextTileInDirection(hero.position, direction, rows, cols)
      const entityOnTile = getEntityOnTile(newState, level, nextPosition)

      const tileIsEmpty = entityOnTile === null
      const tileContainsGate = entityOnTile && entityOnTile.type === entityTypes.gate
      const tileContainsOpenGate = tileContainsGate && isGateOpen(newState, entityOnTile.index)
      const tileCanBeOccupied = tileIsEmpty || tileContainsOpenGate
      if (tileCanBeOccupied) {
        const currentPosition = newState.heroes[newState.activeHeroIndex].position

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
        const entityOnOppositeTile = getEntityOnTile(newState, level, oppositePosition)

        const oppositeTileContainsRock = entityOnOppositeTile && entityOnOppositeTile.type === entityTypes.rock
        if (oppositeTileContainsRock) {
          const rockPosition = newState.rocks[entityOnOppositeTile.index]
          events.push(createMoveEvent(entityOnOppositeTile, rockPosition, currentPosition))
        }

        const oppositeTileContainsHero = entityOnOppositeTile && entityOnOppositeTile.type === entityTypes.hero
        if (oppositeTileContainsHero) {
          const heroPosition = newState.heroes[entityOnOppositeTile.index].position
          events.push(createMoveEvent(entityOnOppositeTile, heroPosition, currentPosition))
        }

        const heroPosition = newState.heroes[newState.activeHeroIndex].position
        const heroEntity:HeroEntity = { type: entityTypes.hero, index: newState.activeHeroIndex }
        events.push(createMoveEvent(heroEntity, heroPosition, nextPosition))
      }
    } else if (hero.type === heroTypes.wizard) {
      let entity:MovableEntity = null

      let currentPosition = getNextTileInDirection(hero.position, direction, rows, cols)
      while(true) {
        const entityOnTile = getEntityOnTile(newState, level, currentPosition)

        if (entityOnTile) {
          if (tileContainsImmovableEntity(newState, entityOnTile)) { break }

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

        const tileContainsRock = entityToSwap.type === entityTypes.rock
        const tileContainsHero = entityToSwap.type === entityTypes.hero

        if (tileContainsRock) {
          const heroIndex = newState.activeHeroIndex
          const heroPosition = { ...hero.position }

          const rockIndex = entityToSwap.index
          const rockPosition = newState.rocks[rockIndex]

          const heroEntity:HeroEntity = { type: entityTypes.hero, index: heroIndex }
          const rockEntity:RockEntity = { type: entityTypes.rock, index: rockIndex }
          events.push(createMoveEvent(heroEntity, heroPosition, rockPosition))
          events.push(createMoveEvent(rockEntity, rockPosition, heroPosition))

          if (heroPosition.x < rockPosition.x) {
            startPosition = { ...heroPosition }
            endPosition = { ...rockPosition }
          } else {
            startPosition = { ...rockPosition }
            endPosition = { ...heroPosition }
          }
        } else if (tileContainsHero) {
          const wizardIndex = newState.activeHeroIndex
          const wizardPosition = { ...hero.position }

          const heroIndex = entityToSwap.index
          const heroPosition = newState.heroes[heroIndex].position

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

        newState = {
          ...newState,
          teleportBeam,
        }
      } else {
        const nextPosition = getNextTileInDirection(hero.position, direction, rows, cols)
        const entityOnTile = getEntityOnTile(newState, level, nextPosition)

        const tileIsEmpty = entityOnTile === null

        if (tileIsEmpty || !tileContainsImmovableEntity(newState, entityOnTile)) {
          newState = moveHero(newState, newState.activeHeroIndex, nextPosition)
        }
      }
    }

    for (let i = 0; i < events.length; i++) {
      const event = events[i]

      if (event.type === eventTypes.move) {
        if (event.entity.type === entityTypes.hero) {
          newState = moveHero(newState, event.entity.index, event.to)
        }

        if (event.entity.type === entityTypes.rock) {
          newState = moveRock(newState, event.entity.index, event.to)
        }
      }
    }

    if (events.length) {
      const turn = [...events]
      newState = {
        ...newState,
        turns: [
          ...newState.turns,
          turn,
        ],
      }
    }

    let allLevelsCleared = false

    const allGoalsOccupiedByHeroes = level.goals.every((goalPosition) => {
      const occupiedByHero = newState.heroes.some(hero => v2Equal(hero.position, goalPosition))
      return occupiedByHero
    })
    const levelCleared = allGoalsOccupiedByHeroes
    if (levelCleared) {
      const nextLevelIndex = newState.levelIndex + 1
      const nextLevelAvailable = nextLevelIndex < levels.length

      if (nextLevelAvailable) {
        newState.gameStatus = gameStatuses.paused
        setTimeout(() => {
          newState.gameStatus = gameStatuses.loading
          pauseTransitions(150)
          loadLevel(nextLevelIndex)
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
      <div className="px-6 py-4 fixed bottom-0 left-0">
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
        {Array.from(Array(rows).keys()).map((row, index) => {
          return (
            <div className="flex" key={`row-${index}`}>
              {Array.from(Array(cols).keys()).map((col, index) => {
                let bgColor = "bg-transparent"
                let borderColor = "border-transparent"

                const tileset = {
                  img: tilesetImg,
                  width: 160,
                  height: 80,
                  tileSize: 16,
                  wallTexture: { x: 4, y: 1 },
                  floorTexture: { x: 5, y: 0 },
                }

                const scale = tileSize / tileset.tileSize
                const bgTileSize = tileset.tileSize * scale
                const bgSize = {
                  x: scale * tileset.width,
                  y: scale * tileset.height,
                }

                let texturePosition:V2|null = null

                const tileValue = getTileValue(level, { x: col, y: row })
                if (tileValue === tileTypes.floor) {
                  bgColor = "bg-gray-100"
                  borderColor = "border-gray-300"
                  texturePosition = { ...tileset.floorTexture }
                } else if (tileValue === tileTypes.wall) {
                  bgColor = "bg-gray-700"
                  borderColor = "border-gray-700"
                  texturePosition = { ...tileset.wallTexture }
                }

                const backgroundX = texturePosition.x * bgTileSize * -1
                const backgroundY = texturePosition.y * bgTileSize * -1
                const backgroundPosition = `${backgroundX}px ${backgroundY}px`

                return (
                  <div 
                    className={`relative flex items-center justify-center ${borderColor} ${bgColor} text-white aspect-square`}
                    style={{ 
                      width: `${tileSize}px`,
                      backgroundImage: `url(${tileset.img})`,
                      backgroundSize: `${bgSize.x}px ${bgSize.y}px`,
                      backgroundPosition,
                      fontSize: 10,
                    }}
                    key={`col-${index}`}
                  >
                  </div>
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

          const isOpen = isGateOpen(state, index)
          const highlightSize = size / 5

          let gateColor:string = null
          if (gate.color === switchGateColors.yellow) {
            gateColor = "#f7e26b"
          } else if (gate.color === switchGateColors.purple) {
            gateColor = "#621fc3"
          }

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
                      backgroundColor: gateColor,
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
        {state.rocks.map((rockPosition, index) => {
          const position = getPosition(rockPosition, tileSize, tileSize)

          const tileset = {
            img: tilesetImg,
            width: 160,
            height: 80,
            tileSize: 16,
          }

          const scale = tileSize / tileset.tileSize
          const bgTileSize = tileset.tileSize * scale
          const bgSize = {
            x: scale * tileset.width,
            y: scale * tileset.height,
          }

          const blockTexturePosition = { x: 9, y: 1 }
          const texturePosition:V2|null = blockTexturePosition

          const backgroundX = texturePosition.x * bgTileSize * -1
          const backgroundY = texturePosition.y * bgTileSize * -1
          const backgroundPosition = `${backgroundX}px ${backgroundY}px`

          return (
            <div 
              className="absolute flex items-center justify-center transition-all"
              key={`rock-${index}`}
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
        {state.heroes.map((hero, index) => {
          const heroPosition = getPosition(hero.position, heroSize, heroSize)

          const isActive = index === state.activeHeroIndex

          return (
            <div 
              key={`hero-${index}`}
              className={classnames("absolute aspect-square rounded-full transition-all", {
                "brightness-50": !isActive,
                "bg-red-600": hero.type === heroTypes.warrior,
                "bg-green-600": hero.type === heroTypes.thief,
                "bg-blue-600": hero.type === heroTypes.wizard,
              })}
              style={{
                width: `${heroSize}px`,
                left: `${heroPosition.x}px`,
                top: `${heroPosition.y}px`,
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