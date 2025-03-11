const path = require('path');

module.exports = {
  entry: './frontend/src/main.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'frontend/public'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'frontend/public'),
    },
    compress: true,
    port: 9000,
  },
  mode: 'development',
};
