const webpack = require('webpack');

module.exports = {
  entry: './index.ts',
  output: {
    path: 'dist',
    filename: 'no-react.js',
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
    new webpack.optimize.UglifyJsPlugin(),
  ]
};
