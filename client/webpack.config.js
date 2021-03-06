'use strict'

const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const zopfli = require('@gfx/zopfli')
const sass = require('sass')

//
// Common configs
//
const commonConfigs = {
  entry: './src/index.js',
  output: {
    filename: 'static-[hash].js',
    path: path.resolve(__dirname, '../public'),
  },
  module: {
    rules: [
      {
        test: /\.md$/,
        use: [{ loader: 'html-loader' }, { loader: 'markdown-loader' }],
      },
      { test: /\.html$/, use: 'html-loader' },
      {
        test: /\.(?:jpg|png|(?:woff2?|ttf|eot|svg)(?:\?v=[0-9]\.[0-9]\.[0-9])?)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'static-[hash].[ext]',
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: sass,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['static-*'],
    }),
    new MiniCssExtractPlugin({
      filename: 'static-[hash].css',
    }),
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
  ],
}

//
// Development-mode configs
//
const development = {
  devtool: 'source-map',
}

//
// Production-mode configs
//
const production = {
  plugins: [
    new webpack.LoaderOptionsPlugin({ minimize: true, debug: false }),
    new CompressionPlugin({
      test: /\.(?:css|js|svg|eot|ttf|html)$/,
      minRatio: 1,
      compressionOptions: {
        numiterations: 15,
      },
      algorithm: zopfli.gzip,
    }),
  ],
}

// Export configs
module.exports = (_, { mode }) =>
  merge(commonConfigs, mode === 'production' ? production : development)
