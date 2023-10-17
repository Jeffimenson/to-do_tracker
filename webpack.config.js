const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.js',
  },
  devtool: 'inline-source-map', //for seeing errors
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development', 
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [ // Note: npx webpack --watch doesn't detect changes in config or package.json files
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'], // Chained from right to left
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
    ],
  },
  mode: 'development',
  
};