const path = require("path")
const htmlWebpackPlugin = require("html-webpack-plugin")
const miniCssExtractPlugin = require("mini-css-extract-plugin")

const paths = require("./paths")

module.exports = {
  entry: path.resolve(paths.src, "index.tsx"),
  resolve: {
    alias: {
      "@": paths.root,
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /.(png|svg|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource',
      },
      {
        test: /.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /.(ts|tsx)$/,
        loader: "ts-loader",
        options: {
          configFile: path.resolve(paths.root, "tsconfig.json"),
        },
        exclude: /node_modules/,
      },
      {
        test: /.css$/i,
        use: [
          miniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                config: path.resolve(paths.bundler, "./postcss.config.js"),
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      template: path.resolve(paths.src, "index.html"),
    }),
    new miniCssExtractPlugin(),
  ],
  output: {
    publicPath: "/",
    filename: "main.js",
    path: paths.build,
    clean: true,
  },
}