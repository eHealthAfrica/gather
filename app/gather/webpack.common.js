/*
 * Copyright (C) 2018 by eHealth Africa : http://www.eHealthAfrica.org
 *
 * See the NOTICE file distributed with this work for additional information
 * regarding copyright ownership.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const path = require('path')
const BundleTracker = require('webpack-bundle-tracker')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')

const buildEntries = require('./webpack.apps')

module.exports = (custom) => ({
  mode: (custom.production ? 'production' : 'development'),
  context: __dirname,

  entry: buildEntries(custom.entryOptions),

  output: Object.assign({
    filename: '[name]-[hash].js',
    library: ['gather', '[name]'],
    libraryTarget: 'var',
    path: path.resolve(__dirname, './assets/bundles/')
  }, custom.output),

  optimization: {
    minimize: custom.production
  },

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: [
          // to transform styles into CSS or JS file
          { loader: (custom.stylesAsCss ? MiniCssExtractPlugin.loader : 'style-loader') },
          { loader: 'css-loader' },
          { loader: 'sass-loader' }
        ]
      },

      // to transform JSX into JS
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          // This is a feature of `babel-loader` for Webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: true
        }
      }
    ]
  },

  plugins: [
    // use to provide the global constants
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      Popper: 'popper.js'
    }),

    // needed by `django-webpack-loader`
    new BundleTracker({
      path: __dirname,
      filename: './assets/bundles/webpack-stats.json'
    }),

    // Environment variables
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(custom.production ? 'production' : 'development')
      }
    }),
    new webpack.EnvironmentPlugin({
      AETHER_KERNEL_URL: '/kernel',
      AETHER_MODULES: 'kernel',
      AETHER_ODK_URL: null,
      CSV_HEADER_RULES: 'remove-prefix:payload.,remove-prefix:None.',
      CSV_HEADER_RULES_SEP: ':',
      CSV_MAX_ROWS_SIZE: null
    }),

    // extract styles as a CSS file not JS file
    ...(custom.stylesAsCss
      ? [new MiniCssExtractPlugin({ filename: '[name]-[chunkhash].css' })]
      : []
    ),

    ...(custom.plugins || [])
  ],

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx']
  }
})