import { Level, V2 } from "@/types"
import { directions } from "@/constants"

export const getRows = (level:Level) => {
  return Math.ceil(level.tilemap.length / level.tilesPerRow)
}

export const getTileValue = (level:Level, position:V2) => {
  return getValueFromPosition(level.tilemap, position, level.tilesPerRow)
}

export const getValueFromPosition = (list:any[], position:V2, itemsPerRow:number) => {
  return list[position.y * itemsPerRow + position.x]
}

export const getNextTileInDirection = (position:V2, direction:directions, rows:number, cols:number):V2 => {
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

export const getWorldPosition = (tilePosition:V2, width:number, height:number, tileSize:number):V2 => {
  return {
    x: (tilePosition.x * tileSize) + (tileSize / 2) - (width / 2),
    y: (tilePosition.y * tileSize) + (tileSize / 2) - (height / 2),
  }
}

export const getTilePositionFromIndex = (index:number, itemsPerRow:number, itemHeight:number = 1):V2 => {
  return {
    x: (index % itemsPerRow),
    y: Math.floor((index * itemHeight) / itemsPerRow),
  }
}