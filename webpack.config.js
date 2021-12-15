const path = require('path')
const fs = require('fs')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const config = require('./config')
const fileName = name =>
  path.basename(
    name.charAt(0).toUpperCase() +
      name.slice(1).replace('.html', '').replace('-', ' ')
  )
const isDevelopment = process.env.NODE_ENV !== 'production'
const title = 'Superior Electoral Court '

const templateFiles = fs
  .readdirSync(config.paths.source)
  .filter(file => path.extname(file).toLowerCase() === '.html')
const htmlPluginEntries = templateFiles.map(
  template =>
    new HTMLWebpackPlugin({
      scriptLoading: 'blocking',
      collapseWhitespace: false,
      collapseInlineTagWhitespace: true,
      keepClosingSlash: true,
      conservativeCollapse: true,
      preserveLineBreaks: false,
      removeComments: false,
      removeTagWhitespace: true,
      removeEmptyAttributes: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: false,
      inject: true,
      minify: false,
      excludeChunks: ['partials'],
      hash: false,
      title: title,
      subtitle: fileName(template) === 'Index' ? 'Home' : fileName(template),
      filename: template,
      template: path.resolve(config.paths.source, template),
      favicon: path.resolve(config.paths.source, 'images', 'favicon.ico'),
      meta: {
        'theme-color': '#163058',
        description:
          'The TSE plays a fundamental role in constructing and developing the Brazilian democracy, in joint action with the Regional Electoral Courts (Tribunais Regionais Eleitorais [TREs]), which are in charge of managing the electoral process in the states and municipalities.',
        'og:type': { property: 'og:type', content: 'website' },
        'og:title': { property: 'og:title', content: title },
        'og:description': {
          property: 'og:description',
          content:
            'The TSE plays a fundamental role in constructing and developing the Brazilian democracy, in joint action with the Regional Electoral Courts (Tribunais Regionais Eleitorais [TREs]), which are in charge of managing the electoral process in the states and municipalities.'
        },
        'og:image': {
          property: 'og:image',
          content: 'https://english.tse.jus.br/images/og-image.png'
        },
        'og:url': {
          property: 'og:url',
          content: `https://english.tse.jus.br/${path.basename(template)}`
        }
      }
    })
)

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  devtool: isDevelopment && 'source-map',
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false
      })
    ]
  },
  entry: {
    global: [
      path.resolve(config.paths.source, 'js', 'global.js'),
      path.resolve(config.paths.source, 'scss', 'global.scss')
    ]
  },
  output: {
    path: config.paths.output,
    filename: isDevelopment ? 'js/[name].js' : 'js/[name].min.js',
    assetModuleFilename: 'assets/[name][ext]'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  devServer: {
    static: {
      directory: config.paths.output,
      publicPath: '/',
      watch: true
    },
    hot: false
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: isDevelopment ? 'css/[name].css' : 'css/[name].min.css'
    }),
    // new ImageMinimizerPlugin({
    //   test: /\.(jpe?g|png|gif|svg)$/i,
    //   minimizerOptions: {
    //     plugins: [
    //       ['gifsicle', { interlaced: true }],
    //       ['jpegtran', { progressive: true }],
    //       ['optipng', { optimizationLevel: 5 }]
    //     ]
    //   }
    // }),
    new CleanWebpackPlugin({
      verbose: true,
      protectWebpackAssets: false,
      cleanOnceBeforeBuildPatterns: ['**/*', '!stats.json', '*.LICENSE.txt']
    })
  ]
    .concat(htmlPluginEntries)
    .filter(Boolean),
  module: {
    rules: [
      {
        test: /\.((c|sa|sc)ss)$/i,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: true
            }
          },
          { loader: 'postcss-loader' },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.(j|t)sx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              isDevelopment && require.resolve('react-refresh/babel'),
              isDevelopment && new ReactRefreshWebpackPlugin()
            ].filter(Boolean)
          }
        }
      },
      {
        test: /\.(png|gif|jpe?g|svg)$/i,
        type: 'asset/resource',
        parser: {
          dataUrlCondition: {
            maxSize: config.limits.images
          }
        },
        generator: {
          filename: isDevelopment ? '[path][name][ext]' : 'images/[name][ext]'
        }
      },

      {
        test: /\.(eot|ttf|woff|woff2)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: config.limits.fonts
          }
        },
        generator: {
          filename: 'fonts/[name].[ext]'
        }
      }
    ]
  },
  target: 'web'
}
