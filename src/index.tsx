import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import classnames from "classnames"

import "./index.css"

import tilesetImg from "./assets/tileset.png"
import playerTilesetImg from "./assets/players.png"

const enum entityTypes {
  hero = "hero",
  block = "block",
  gate = "gate",
  wall = "wall",
}

const enum eventTypes {
  move = "move",
  switchHero = "switchHero",
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
  | BlockEntity
  | WallEntity
)

type Event = MoveEvent | SwitchHeroEvent

type GateEntity = {
  type: entityTypes.gate,
  index: number,
}

type HeroEntity = {
  type: entityTypes.hero,
  index: number,
}

type Level = {
  textures?: {
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
  switchGates?: SwitchGate[],
}

type MovableEntity = HeroEntity | BlockEntity

type MoveEvent = {
  type: eventTypes.move,
  entity: MovableEntity,
  from: V2,
  to: V2,
}

type BlockEntity = {
  type: entityTypes.block,
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
  blocks: V2[],
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

type SwitchHeroEvent = {
  type: eventTypes.switchHero,
  previousActiveHeroIndex: number,
  nextActiveHeroIndex: number,
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
    popupMessage: `Use <span class="text-yellow-400">W A S D</span> or <span class="text-yellow-400">arrow</span> keys to move`,
    textures: {
      surfaces: [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 21, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 21, 31, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 34, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
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
    textures: {
      surfaces: [1, 3, 3, 3, 23, 3, 3, 3, 23, 3, 3, 3, 4, 21, 6, 6, 6, 33, 6, 6, 6, 33, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 22, 6, 6, 6, 22, 6, 6, 6, 21, 31, 3, 3, 3, 32, 3, 3, 3, 32, 3, 3, 3, 34, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 0, 30, 30, 30, 0, 30, 30, 30, 0, 0, 0, 0, 0, 30, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    popupMessage: "<span class='text-red-500'>Red warrior</span> pushes blocks",
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 13,
    blocks: [
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
    textures: {
      surfaces: [1, 3, 3, 3, 23, 3, 3, 3, 23, 3, 3, 3, 4, 21, 6, 6, 6, 33, 6, 6, 6, 21, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 33, 6, 6, 6, 21, 21, 6, 6, 6, 22, 6, 6, 6, 6, 6, 6, 6, 21, 31, 3, 3, 3, 32, 3, 3, 3, 3, 3, 3, 3, 34, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 0, 30, 30, 30, 0, 30, 30, 30, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    popupMessage: "Hold down Switches to open doors",
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2,
      2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
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
    blocks: [
      { x: 4, y: 2 },
    ],
    goals: [{ x: 10, y: 2 }],
  },
  {
    textures: {
      surfaces: [1, 3, 3, 3, 3, 3, 23, 3, 4, 21, 6, 6, 6, 6, 6, 21, 6, 21, 21, 6, 15, 6, 6, 6, 33, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 21, 31, 3, 3, 3, 3, 3, 3, 3, 34, 41, 41, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 30, 30, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
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
      2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 9,
    heroes: [
      {
        type: heroTypes.warrior,
        position: { x: 1, y: 4, },
      },
    ],
    blocks: [
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
    textures: {
      surfaces: [1, 3, 3, 3, 23, 3, 3, 3, 23, 3, 3, 3, 4, 21, 6, 6, 6, 33, 6, 6, 6, 21, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 33, 6, 6, 6, 21, 21, 6, 6, 6, 22, 6, 6, 6, 6, 6, 6, 6, 21, 31, 3, 3, 3, 32, 3, 3, 3, 3, 3, 3, 3, 34, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 0, 30, 30, 30, 0, 30, 30, 30, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    popupMessage: "<span class='text-green-500'>Green thief</span> pulls blocks",
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
    blocks: [
      { x: 4, y: 2 },
      { x: 7, y: 1 },
      { x: 7, y: 3 },
    ],
    goals: [{ x: 10, y: 2 }],
  },
  {
    textures: {
      surfaces: [1, 3, 3, 3, 3, 3, 23, 3, 4, 21, 6, 6, 6, 6, 6, 21, 6, 21, 21, 6, 15, 6, 6, 6, 33, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 21, 31, 3, 3, 3, 3, 3, 3, 3, 34, 41, 41, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 30, 30, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 1, 1, 2, 1, 2,
      2, 1, 2, 1, 1, 1, 2, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 9,
    heroes: [
      {
        type: heroTypes.thief,
        position: { x: 1, y: 4, },
      },
    ],
    blocks: [
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
    textures: {
      surfaces: [1, 3, 3, 3, 23, 23, 3, 3, 4, 21, 6, 6, 6, 31, 14, 6, 6, 21, 21, 6, 15, 6, 6, 31, 12, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 15, 6, 15, 6, 15, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 21, 31, 3, 3, 3, 3, 3, 3, 3, 34, 41, 41, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 0, 0, 30, 30, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 30, 0, 0, 30, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 30, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
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
    blocks: [
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
    textures: {
      surfaces: [1, 3, 3, 3, 3, 3, 3, 3, 23, 3, 3, 3, 4, 21, 6, 6, 6, 6, 6, 6, 6, 33, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 22, 6, 6, 6, 22, 6, 6, 6, 21, 31, 3, 3, 3, 32, 3, 3, 3, 32, 3, 3, 3, 34, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 30, 30, 30, 30, 0, 30, 30, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    popupMessage: "<span class='text-blue-500'>Blue Wizard</span> teleports to blocks",
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
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
    blocks: [
      { x: 4, y: 1 },
      { x: 4, y: 2 },
    ],
    goals: [{ x: 10, y: 2 }],
  },
  {
    textures: {
      surfaces: [1, 3, 3, 3, 3, 3, 23, 3, 4, 21, 6, 6, 6, 6, 6, 21, 6, 21, 21, 6, 15, 6, 6, 6, 33, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 21, 31, 3, 3, 3, 3, 3, 3, 3, 34, 41, 41, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 30, 30, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 1, 1, 2, 1, 2,
      2, 1, 2, 1, 1, 1, 2, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 9,
    heroes: [
      {
        type: heroTypes.wizard,
        position: { x: 5, y: 3, },
      },
    ],
    blocks: [
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
    textures: {
      surfaces: [1, 3, 23, 3, 23, 3, 4, 21, 6, 21, 6, 21, 6, 21, 21, 6, 33, 6, 33, 6, 21, 21, 6, 6, 6, 6, 6, 21, 21, 6, 13, 3, 12, 6, 21, 21, 6, 6, 6, 6, 6, 21, 31, 3, 3, 3, 3, 3, 34, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 30, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    tilemap: [
      2, 2, 2, 2, 2, 2, 2,
      2, 1, 2, 1, 2, 1, 2,
      2, 1, 2, 1, 2, 1, 2,
      2, 1, 1, 1, 1, 1, 2,
      2, 1, 2, 2, 2, 1, 2,
      2, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2,
    ],
    tilesPerRow: 7,
    heroes: [
      {
        type: heroTypes.wizard,
        position: { x: 1, y: 1, },
      },
    ],
    blocks: [
      { x: 1, y: 3 },
      { x: 1, y: 5 },
      { x: 3, y: 5 },
      { x: 5, y: 3 },
      { x: 5, y: 1 },
    ],
    goals: [{ x: 3, y: 1 }],
  },
  {
    textures: {
      surfaces: [1, 3, 3, 3, 23, 3, 3, 3, 23, 3, 3, 3, 4, 21, 6, 6, 6, 33, 6, 6, 6, 33, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 22, 6, 6, 6, 22, 6, 6, 6, 21, 21, 3, 3, 3, 2, 3, 3, 3, 2, 3, 3, 3, 21, 21, 6, 6, 6, 33, 6, 6, 6, 33, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 22, 6, 6, 6, 22, 6, 6, 6, 21, 31, 3, 3, 3, 32, 3, 3, 3, 32, 3, 3, 3, 34, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 0, 30, 30, 30, 0, 30, 30, 30, 0, 0, 0, 0, 0, 30, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 0, 30, 30, 30, 0, 30, 30, 30, 0, 0, 0, 0, 0, 30, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    popupMessage: `Press <span class="text-yellow-400">X</span> to switch heroes`,
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
    blocks: [],
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
    textures: {
      surfaces: [1, 3, 23, 3, 3, 23, 23, 3, 3, 3, 4, 21, 6, 21, 6, 6, 31, 14, 6, 6, 6, 21, 21, 6, 33, 6, 6, 6, 21, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 33, 6, 6, 13, 14, 21, 6, 1, 23, 4, 6, 6, 6, 6, 6, 21, 31, 3, 32, 32, 32, 3, 3, 3, 3, 3, 34, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 30, 30, 0, 0, 30, 30, 30, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    popupMessage: "Heroes can move each other",
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 2, 1, 1, 2, 2, 1, 1, 1, 2,
      2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2,
      2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 2,
      2, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
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
    blocks: [
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
    textures: {
      surfaces: [1, 3, 3, 3, 3, 23, 3, 3, 23, 3, 4, 21, 6, 6, 6, 6, 33, 6, 6, 33, 6, 21, 21, 6, 6, 22, 6, 6, 6, 6, 6, 6, 21, 11, 3, 3, 14, 6, 6, 6, 6, 6, 6, 21, 21, 6, 6, 33, 6, 1, 12, 6, 13, 3, 14, 21, 6, 6, 6, 6, 21, 6, 6, 6, 6, 21, 31, 3, 3, 3, 3, 32, 3, 3, 3, 3, 34, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 30, 0, 30, 30, 0, 30, 0, 0, 0, 0, 0, 0, 30, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 30, 0, 30, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 2,
      2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 2,
      2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
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
    blocks: [
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
    textures: {
      surfaces: [1, 3, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 4, 21, 6, 31, 32, 32, 32, 32, 32, 32, 32, 32, 32, 14, 21, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 1, 3, 3, 4, 6, 1, 23, 23, 3, 3, 14, 21, 6, 21, 6, 6, 33, 6, 31, 32, 34, 6, 6, 21, 21, 6, 21, 6, 6, 6, 6, 6, 6, 6, 6, 6, 21, 21, 6, 21, 6, 6, 22, 6, 1, 23, 4, 6, 6, 21, 21, 6, 31, 3, 3, 34, 6, 31, 32, 32, 3, 3, 14, 21, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 21, 31, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 34, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 0, 0, 0, 0, 0, 30, 30, 0, 0, 0, 0, 0, 0, 30, 0, 30, 30, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 30, 0, 30, 30, 30, 30, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
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
    blocks: [
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
    textures: {
      surfaces: [1, 23, 3, 3, 23, 3, 23, 3, 23, 3, 3, 3, 4, 11, 34, 6, 6, 33, 6, 33, 6, 33, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 21, 11, 4, 6, 6, 22, 6, 1, 23, 4, 6, 6, 6, 21, 31, 32, 3, 3, 32, 3, 32, 32, 32, 3, 3, 3, 34, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 0, 30, 0, 30, 0, 30, 30, 30, 0, 0, 30, 0, 0, 30, 0, 30, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    tilemap: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 
      2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 
      2, 2, 1, 1, 2, 1, 2, 2, 2, 1, 1, 1, 2, 
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
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
    blocks: [
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
    textures: {
      surfaces: [1, 3, 3, 3, 3, 3, 3, 3, 4, 21, 6, 6, 6, 6, 6, 6, 6, 21, 11, 3, 3, 3, 3, 3, 4, 6, 21, 21, 6, 6, 6, 6, 6, 21, 6, 21, 21, 6, 6, 1, 12, 6, 21, 6, 21, 21, 6, 6, 21, 6, 6, 21, 6, 21, 11, 12, 6, 31, 3, 3, 34, 6, 21, 21, 6, 6, 6, 6, 6, 6, 6, 21, 11, 4, 6, 1, 23, 23, 4, 6, 21, 31, 32, 3, 32, 32, 32, 32, 3, 34, 41, 41, 41, 41, 41, 41, 41, 41, 41],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 30, 30, 30, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 30, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 30, 30, 30, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
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
    blocks: [
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
    textures: {
      surfaces: [1, 3, 3, 3, 3, 3, 4, 21, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 21, 21, 6, 6, 6, 6, 6, 21, 31, 3, 3, 3, 3, 3, 34],
      shadows: [0, 0, 0, 0, 0, 0, 0, 0, 30, 30, 30, 30, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
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
    blocks: [
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
  // {
  //   tilemap: [
  //     2, 2, 2, 2, 2, 2, 2, 2, 
  //     2, 1, 1, 1, 1, 1, 1, 2,
  //     2, 2, 2, 2, 2, 2, 2, 2, 
  //     2, 1, 1, 1, 1, 1, 1, 2,
  //     2, 2, 2, 2, 2, 2, 2, 2, 
  //     2, 1, 1, 1, 1, 1, 1, 2,
  //     2, 2, 2, 2, 2, 2, 2, 2, 
  //   ],
  //   tilesPerRow: 8,
  //   heroes: [
  //     {
  //       type: heroTypes.warrior,
  //       position: { x: 1, y: 3, },
  //     },
  //     {
  //       type: heroTypes.thief,
  //       position: { x: 1, y: 5, },
  //     },
  //     {
  //       type: heroTypes.wizard,
  //       position: { x: 1, y: 1, },
  //     },
  //   ],
  //   blocks: [
  //     { x: 6, y: 1 },
  //     { x: 2, y: 3 },
  //     { x: 3, y: 3 },
  //   ],
  //   goals: [
  //     { x: 4, y: 1 },
  //     { x: 4, y: 3 },
  //     { x: 4, y: 5 },
  //   ],
  // },
]

const tileSize = 55
const heroWidth = tileSize
const heroHeight = tileSize * 2

const tileset = {
  img: tilesetImg,
  width: 64 * 10,
  height: 64 * 6,
  tileSize: 64,
  texturesPerRow: 10,
}

const playerTileset = {
  img: playerTilesetImg,
  width: 64 * 8,
  height: 64 * 12,
  tileSize: 64,
  texturesPerRow: 6,
}

const createMoveEvent = (entity:MovableEntity, from:V2, to:V2):MoveEvent => {
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
    blocks: level.blocks ? level.blocks.map(position => ({ ...position })) : [],
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

  return null
}

const getTileValue = (level:Level, position:V2) => {
  return getValueFromPosition(level.tilemap, position, level.tilesPerRow)
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

const getPositionFromIndex = (index:number, itemsPerRow:number, itemHeight:number = 1):V2 => {
  return {
    x: (index % itemsPerRow),
    y: Math.floor((index * itemHeight) / itemsPerRow),
  }
}

const getValueFromPosition = (list:any[], position:V2, itemsPerRow:number) => {
  return list[position.y * itemsPerRow + position.x]
}

const isGateOpen = (state:State, gateIndex:number):boolean => {
  const gate = state.switchGates[gateIndex]

  const allSwitchesPressed = gate.switches.every(switchPosition => {
    const isHeroOnSwitch = state.heroes.some(hero => {
      return v2Equal(switchPosition, hero.position)
    })

    const isBlockOnSwitch = state.blocks.some(
      blockPosition => v2Equal(blockPosition, switchPosition)
    )

    return isHeroOnSwitch || isBlockOnSwitch
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

const moveBlock = (state:State, blockIndex:number, position:V2):State => {
  return {
    ...state,
    blocks: [
      ...state.blocks.slice(0, blockIndex),
      { ...position },
      ...state.blocks.slice(blockIndex + 1),
    ]
  }
}

const pauseTransitions = (duration:number) => {
  document.documentElement.classList.add("disable-transitions")
  setTimeout(() => {
    document.documentElement.classList.remove("disable-transitions")
  }, duration)
}

const processEvent = (state:State, event:Event):State => {
  let newState = {...state}

  if (event.type === eventTypes.move) {
    event = event as MoveEvent

    if (event.entity.type === entityTypes.hero) {
      newState = moveHero(newState, event.entity.index, event.to)
    }

    if (event.entity.type === entityTypes.block) {
      newState = moveBlock(newState, event.entity.index, event.to)
    }
  } else if (event.type === eventTypes.switchHero) {
    event = event as SwitchHeroEvent

    newState = {
      ...newState,
      activeHeroIndex: event.nextActiveHeroIndex,
    }
  }

  return newState
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
        const stateWithPopupHidden = {
          ...state,
          popup: {
            ...state.popup,
            visible: false,
          },
        }
        setState({ ...stateWithPopupHidden })
      }
      return
    }

    const zKeyPressed = key === "z" || key === "Z"
    const userPressedUndoButton = zKeyPressed

    if (userPressedUndoButton) {
      const noTurnsAvailableToUndo = state.turns.length === 0

      if (noTurnsAvailableToUndo) {
        return
      }

      let newState = { ...state }

      const previousTurnEvents = newState.turns[newState.turns.length - 1]

      for (let i = 0; i < previousTurnEvents.length; i++) {
        const event = previousTurnEvents[i]

        let reversedEvent = null

        if (event.type === eventTypes.move) {
          reversedEvent = {
            ...event,
            from: { ...event.to },
            to: { ...event.from },
          }
        } else if (event.type === eventTypes.switchHero) {
          reversedEvent = {
            ...event,
            previousActiveHeroIndex: event.nextActiveHeroIndex,
            nextActiveHeroIndex: event.previousActiveHeroIndex,
          }
        }

        newState = processEvent(newState, reversedEvent)
      }

      const turnsWithoutCurrentTurn = newState.turns.slice(0, -1)
      newState = {
        ...newState,
        turns: turnsWithoutCurrentTurn,
      }

      setState({ ...newState })
      return
    }

    const rKeyPressed = key === "r" || key === "R"
    const userPressedResetButton = rKeyPressed

    if (userPressedResetButton) {
      pauseTransitions(150)
      loadLevel(state.levelIndex)
      return
    }

    const userPressedSwitchHeroButton = xKeyPressed(key)

    if (userPressedSwitchHeroButton) {
      const levelHasMultipleHeroes = levels[state.levelIndex].heroes.length > 0

      if (!levelHasMultipleHeroes) {
        return
      }

      const currentActiveHeroIndex = state.activeHeroIndex
      const nextActiveHeroIndex = (state.activeHeroIndex + 1) % state.heroes.length

      const switchHeroEvent:SwitchHeroEvent = {
        type: eventTypes.switchHero,
        previousActiveHeroIndex: currentActiveHeroIndex,
        nextActiveHeroIndex: nextActiveHeroIndex,
      }

      let newState:State = { ...state }

      newState = processEvent(state, switchHeroEvent)
      newState = {
        ...newState,
        turns: [
          ...newState.turns,
          [switchHeroEvent],
        ],
      }

      setState(newState)

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

    if (direction === null) {
      return
    }

    let newState:State = { ...state }
    const events:Event[] = []

    const level = levels[newState.levelIndex]
    const rows = getRows(level)
    const cols = level.tilesPerRow
    const hero = newState.heroes[newState.activeHeroIndex]

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
          const hero = newState.heroes[entity.index]
          const nextPosition = getNextTileInDirection(hero.position, direction, rows, cols)
          events.push(createMoveEvent(entity, hero.position, nextPosition))
        } else if (tileContainsBlock) {
          const blockPosition = newState.blocks[entity.index]
          const nextPosition = getNextTileInDirection(blockPosition, direction, rows, cols)
          events.push(createMoveEvent(entity, blockPosition, nextPosition))
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

        const oppositeTileContainsBlock = entityOnOppositeTile && entityOnOppositeTile.type === entityTypes.block
        if (oppositeTileContainsBlock) {
          const blockPosition = newState.blocks[entityOnOppositeTile.index]
          events.push(createMoveEvent(entityOnOppositeTile, blockPosition, currentPosition))
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

        const tileContainsBlock = entityToSwap.type === entityTypes.block
        const tileContainsHero = entityToSwap.type === entityTypes.hero

        if (tileContainsBlock) {
          const heroIndex = newState.activeHeroIndex
          const heroPosition = { ...hero.position }

          const blockIndex = entityToSwap.index
          const blockPosition = newState.blocks[blockIndex]

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
          const heroEntity:HeroEntity = {
            type: entityTypes.hero,
            index: newState.activeHeroIndex,
          }
          const currentPosition = { ...hero.position }
          events.push(createMoveEvent(heroEntity, currentPosition, nextPosition))
        }
      }
    }

    if (events.length === 0) {
      return
    }

    events.forEach(event => {
      newState = processEvent(newState, event)
    })

    const currentTurnEvents = [...events]
    newState = {
      ...newState,
      turns: [
        ...newState.turns,
        currentTurnEvents,
      ],
    }

    setState(newState)

    if (newState.teleportBeam.visible) {
      setTimeout(() => {
        const stateWithTeleportBeamHidden = {
          ...newState,
          teleportBeam: {
            ...newState.teleportBeam, 
            visible: false,
          },
        }
        setState({ ...stateWithTeleportBeamHidden })
      }, 150)
    }

    let allLevelsCleared = false

    const currentLevel = levels[newState.levelIndex]
    const allGoalsOccupiedByHeroes = currentLevel.goals.every((goalPosition) => {
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
    const imagesToBeLoaded = [
      tilesetImg,
      playerTilesetImg,
    ]

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
      <div className="fixed z-50 w-full h-full flex items-center justify-center">
        <div className="px-20 py-20 flex-col border border-white rounded-xl">
          <p className="text-center text-28 text-white">Thank you for playing</p>
          <p className="mt-14 text-center text-20 text-white">Press <span className="text-yellow-400">X</span> to continue</p>
        </div>
      </div>
    )
  }

  const level = levels[state.levelIndex]
  const rows = getRows(level)
  const cols = level.tilesPerRow

  const levelContainsTextures = level.textures

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

                const surfaceTexturePosition = getPositionFromIndex(surfaceTextureIndex, tileset.texturesPerRow)
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
                      className="absolute w-full h-full"
                      style={{
                        backgroundImage: `url(${tileset.img})`,
                        backgroundSize: `${bgSize.x}px ${bgSize.y}px`,
                        backgroundPosition: `${surfaceBackgroundX}px ${surfaceBackgroundY}px`,
                      }}
                    ></div>
                  </div>
                )
              })}
            </div>
          )
        })}
        {level.goals.map((goalPosition, index) => {
          const mapPosition = getPosition(goalPosition, tileSize, tileSize)

          const scale = tileSize / tileset.tileSize
          const bgTileSize = tileset.tileSize * scale
          const bgSize = {
            x: scale * tileset.width,
            y: scale * tileset.height,
          }

          const goalTextureIndex = 9
          const texturePosition = getPositionFromIndex(goalTextureIndex, tileset.texturesPerRow)

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
        {state.blocks.map((blockPosition, index) => {
          const position = getPosition(blockPosition, tileSize, tileSize)

          const scale = tileSize / tileset.tileSize
          const bgTileSize = tileset.tileSize * scale
          const bgSize = {
            x: scale * tileset.width,
            y: scale * tileset.height,
          }

          const blockTextureIndex = 19
          const texturePosition = getPositionFromIndex(blockTextureIndex, tileset.texturesPerRow)

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
        {levelContainsTextures && (
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

                    const shadowTexturePosition = getPositionFromIndex(shadowTextureIndex, tileset.texturesPerRow)
                    const shadowBackgroundX = shadowTexturePosition.x * bgTileSize * -1
                    const shadowBackgroundY = shadowTexturePosition.y * bgTileSize * -1

                    const tilePosition = getPosition({ x: col, y: row }, tileSize, tileSize)

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
        )}
        {state.heroes.map((hero, index) => {
          const heroPosition = {
            x: (hero.position.x * tileSize) + (tileSize / 2) - (heroWidth / 2),
            y: (hero.position.y * tileSize) - tileSize,
          }
          const isActive = index === state.activeHeroIndex

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

          const texturePosition = getPositionFromIndex(playerTextureIndex, tileset.texturesPerRow, 2)
          const backgroundX = texturePosition.x * bgTileSize * -1
          const backgroundY = texturePosition.y * bgTileSize * -1

          const zIndex = 5 + hero.position.y

          let animation = ""

          if (isActive) {
            if (hero.type === heroTypes.warrior) {
              animation = "warrior__idle"
            } else if (hero.type === heroTypes.thief) {
              animation = "thief__idle"
            } else if (hero.type === heroTypes.wizard) {
              animation = "wizard__idle"
            }
          }

          return (
            <div
              key={`hero-${index}`}
              className={classnames(`${animation} absolute rounded-full transition-all`, {
                "brightness-50": !isActive,
              })}
              style={{
                width: `${heroWidth}px`,
                height: `${heroHeight}px`,
                left: `${heroPosition.x}px`,
                top: `${heroPosition.y}px`,
                backgroundImage: `url(${tileset.img})`,
                backgroundSize: `${bgSize.x}px ${bgSize.y}px`,
                backgroundPosition: `${backgroundX}px ${backgroundY}px`,
                zIndex,
              }}
            />
          )
        })}
      </div>
      {state.popup.visible && (
        <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-10 py-14 border-2 border-white bg-gray-900 text-white rounded-lg shadow-md">
          <p className="text-24 text-center" dangerouslySetInnerHTML={{ __html: state.popup.message }}></p>
          <p className="mt-10 text-18 text-center">Press <span className="text-yellow-400">X</span> to Continue</p>
        </div>
      )}
    </>
  )
}

createRoot(document.getElementById("app")).render(<App />)