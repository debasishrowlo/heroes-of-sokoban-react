const path = require("path")
const { merge } = require("webpack-merge")

const paths = require("./paths")
const common = require("./webpack.common")

module.exports = merge(common, {
  mode: "development",
  devtool: "source-map",
  devServer: {
    static: {
      directory: paths.build,
    },
    historyApiFallback: true,
    open: true,
    compress: true,
    port: 9001,
    watchFiles: path.resolve(paths.src, "index.html"),
  },
})