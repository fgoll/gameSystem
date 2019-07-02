const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    resolve: {
      alias: {
        '@': resolve('src'),
      },
    },
  },

  chainWebpack: (config) => {
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end();

    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
      .end();
  },
};
