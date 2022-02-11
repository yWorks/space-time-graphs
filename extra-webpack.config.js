const YWorksOptimizerPlugin = require('@yworks/optimizer/webpack-plugin')

module.exports = function (config) {
  if (config.mode === 'production') {
    // Obfuscate yFiles modules and usages for production build
    config.plugins.push(
      new YWorksOptimizerPlugin({
        logLevel: 'info',
        blacklist: [
          'update',
          'ofType',
          'nodes',
          'edges',
          'selectAll',
          'getPosition',
          'setPosition',
          'range',
          'context',
          'move',
          'invert',
          'level',
          'animate',
          'template',
          'sum'
        ],
      })
    )
  }

  return config
}
