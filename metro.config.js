const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

const config = getDefaultConfig(__dirname);

// Ensure web platform is properly configured
if (!config.resolver) {
  config.resolver = {};
}
config.resolver.sourceExts = [
  ...(config.resolver.sourceExts || []),
  "web.js",
  "web.ts",
  "web.tsx",
];
config.resolver.platforms = ["ios", "android", "native", "web"];

// Ensure transformer handles web
if (!config.transformer) {
  config.transformer = {};
}
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

const finalConfig = withRorkMetro(config);
module.exports = finalConfig;
