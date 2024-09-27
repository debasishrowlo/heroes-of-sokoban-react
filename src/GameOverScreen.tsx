import { useEffect } from "react"

import { State } from "./types"
import { isXKeyPressed } from "./Game"

const GameOverScreen = ({
  state,
  showLevelSelectScreen,
} : {
  state:State
  showLevelSelectScreen: () => void,
}) => {
  const handleKeyDown = (e:KeyboardEvent) => {
    if (isXKeyPressed(e)) {
      showLevelSelectScreen()
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <div className="fixed z-50 w-full h-full flex items-center justify-center">
      <div className="px-20 py-20 flex-col border border-white rounded-xl">
        <p className="text-center text-28 text-white">Thank you for playing</p>
        <p className="mt-14 text-center text-20 text-white">Press <span className="text-yellow-400">X</span> to continue</p>
      </div>
    </div>
  )
}

export default GameOverScreen