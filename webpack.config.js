const path = require('path')

module.exports = {
  entry: {
    wowza: path.resolve(__dirname, 'src', 'index.js')
  },
  output: {
    library: 'Wowza',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: [/node_modules/],
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-flow',
              [
                '@babel/preset-env',
                {
                  browsers: ['last 2 versions', 'ie >= 11']
                }
              ]
            ],
            plugins: [
              '@babel/plugin-proposal-object-rest-spread'
            ]
          }
        }]
      }
    ]
  }
}
