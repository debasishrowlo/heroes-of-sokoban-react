const path = require("path")

const paths = require("./paths")

module.exports = {
  plugins: {
    tailwindcss: {
      config: path.resolve(paths.bundler, "tailwind.config.js"),
    },
    autoprefixer: {},
  }
}