const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src', 'index.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'static', 'index.html') }),
    new CopyWebpackPlugin({
      patterns: [
          { from: 'static/example.ppm' }
      ]
    })
  ]
};
