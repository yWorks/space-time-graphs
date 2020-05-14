const YWorksOptimizerPlugin = require('@yworks/optimizer/webpack-plugin')

module.exports = function(config) {
  if (config.mode === 'production') {
    // Obfuscate yFiles modules and usages for production build
    config.plugins.push(
      new YWorksOptimizerPlugin({
        logLevel: 'debug',
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
          'animate'
        ]
      })
    )
  } else {
    // Add yFiles debugging support for development build
    console.log('Development build - adding yfiles-typeinfo.js for improved debugging')
    config.entry.main.unshift('src/assets/yfiles/yfiles-typeinfo.js')
  }

  return config
}
