import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import levels from "./levels"
import {
  directions, 
  gameStatuses, 
  heroStates, 
  playerTileset,
  tileset,
  tileSize,
} from "./constants"
import { State } from "./types"
import { getRows } from "./lib/tilemap"

import Game from "./Game"
import GameOverScreen from "./GameOverScreen"
import LevelSelectScreen from "./LevelSelectScreen"

import "./index.css"

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
    heroes: level.heroes.map(hero => ({
      ...hero,
      direction: directions.right,
      state: heroStates.idle,
    })),
    activeHeroIndex: 0,
    blocks: level.blocks ? level.blocks.map(position => ({ ...position })) : [],
    gates: level.gates ? [...level.gates] : [],
    switches: level.switches ? [...level.switches] : [],
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

const isGameOver = (state:State) => {
  return state.gameStatus === gameStatuses.win
}

const App = () => {
  const [state, setState] = useState<State>(generateLevel(0))
  const [imagesLoading, setImagesLoading] = useState(true)

  const loadLevel = (index:number) => {
    setState(generateLevel(index))
  }

  const showLevelSelectScreen = () => {
    setState(null)
  }

  const preloadImages = async () => {
    const imagesToBeLoaded = [
      tileset.img,
      playerTileset.img,
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

    setImagesLoading(false)
  }

  const isLoading = () => {
    return imagesLoading || state.gameStatus === gameStatuses.loading
  }

  const levelNotSelected = () => {
    return state === null
  }

  useEffect(() => {
    preloadImages()
  }, [])

  if (levelNotSelected()) {
    return <LevelSelectScreen loadLevel={loadLevel} />
  }

  if (isLoading()) {
    return null
  }

  if (isGameOver(state)) {
    return (
      <GameOverScreen
        state={state}
        showLevelSelectScreen={showLevelSelectScreen}
      />
    )
  }

  return (
    <Game
      state={state}
      setState={setState}
      loadLevel={loadLevel}
      showLevelSelectScreen={showLevelSelectScreen}
    />
  )
}

createRoot(document.getElementById("app")).render(<App />)