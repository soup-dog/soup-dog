const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/js/index.js',
    metaballs: './src/js/metaballs.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'docs'),
  },
  module: {
    rules: [
      {
        test: /\.glsl/,
        type: 'asset/source',
      }
    ]
  },
};