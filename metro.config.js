const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  config.resolver.unstable_conditionNames = ['require', 'default', 'browser'];
  return config;
})();