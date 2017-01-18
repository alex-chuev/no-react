const webpack = require('webpack');

module.exports = {
  entry: {
    "no-react": "./index.ts",
    "no-react.min": "./index.ts",
  },
  output: {
    path: './dist',
    filename: "[name].js",
    library: 'NoReact',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['', '.ts', '.js'],
  },
  module: {
    loaders: [{
      test: /\.ts$/,
      loaders: ['awesome-typescript-loader'],
      exclude: /node_modules/
    }],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true
    })
  ]
};
