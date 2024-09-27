import levels from "./levels"

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

export default LevelSelectScreen