import tilesetImg from "./assets/tileset.png"
import playerTilesetImg from "./assets/players.png"

export const heroWalkDuration = 150

export const enum entityTypes {
  hero = "hero",
  block = "block",
  gate = "gate",
  wall = "wall",
}

export const enum eventTypes {
  move = "move",
  switchHero = "switchHero",
  destroy = "destroy",
}

export const enum directions {
  up = "up",
  down = "down",
  left = "left",
  right = "right",
}

export const enum gameStatuses { 
  loading = "loading",
  playing = "playing",
  paused = "paused",
  win = "win",
}

export const enum heroStates {
  idle = "idle",
  walking = "walking",
}

export const enum heroTypes {
  warrior = "warrior",
  thief = "thief",
  wizard = "wizard",
}

export const enum colors {
  yellow = "yellow",
  purple = "purple",
}

export const enum tileTypes {
  empty = 0,
  floor = 1,
  wall = 2,
}

export const tileSize = 55
export const heroWidth = tileSize
export const heroHeight = tileSize * 2

export const tileset = {
  img: tilesetImg,
  width: 64 * 10,
  height: 64 * 6,
  tileSize: 64,
  texturesPerRow: 10,
}

export const playerTileset = {
  img: playerTilesetImg,
  width: 64 * 8,
  height: 64 * 12,
  tileSize: 64,
  texturesPerRow: 6,
}