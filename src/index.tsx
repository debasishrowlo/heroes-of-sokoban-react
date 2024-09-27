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

const LevelSelectScreen = ({
  loadLevel,
}: {
  loadLevel: (index: number) => void;
}) => {
  return (
    <div className="container h-screen mx-auto flex items-center justify-center max-w-2xl">
      <div>
        <h1 className="text-20 text-white">Select Level</h1>
        <div className="mt-4 flex flex-wrap gap-6">
          {levels.map((_, index) => {
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

const GameOverScreen = () => {
  return (
    <div className="fixed z-50 w-full h-full flex items-center justify-center">
      <div className="px-20 py-20 flex-col border border-white rounded-xl">
        <p className="text-center text-28 text-white">Thank you for playing</p>
        <p className="mt-14 text-center text-20 text-white">Press <span className="text-yellow-400">X</span> to continue</p>
      </div>
    </div>
  )
}

const App = () => {
  const [state, setState] = useState<State>(generateLevel(0))
  const [imagesLoading, setImagesLoading] = useState(true)

  const loadLevel = (index:number) => {
    setState(generateLevel(index))
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

  const isGameOver = () => {
    return state.gameStatus === gameStatuses.win
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

  if (isGameOver()) {
    return <GameOverScreen />
  }

  return (
    <Game
      state={state}
      setState={setState}
      loadLevel={loadLevel}
    />
  )
}

createRoot(document.getElementById("app")).render(<App />)