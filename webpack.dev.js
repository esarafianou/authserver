const pathModule = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const PORT = process.env.PORT || 8080

module.exports = {
  entry: './views/app.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ hash: true, title: 'Authorization Server' })
  ],
  devServer: {
    historyApiFallback: true,
    port: 3000,
    proxy: {
      '/': `http://localhost:${PORT}`
    },
    stats: {
      colors: true
    }
  },
  output: {
    publicPath: '/',
    path: pathModule.resolve(__dirname, 'dist'),
    filename: 'app.js'
  }
}
