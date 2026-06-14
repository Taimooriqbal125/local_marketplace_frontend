// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for .lottie files
config.resolver.assetExts.push('lottie');

// Exclude test files from being bundled into the app
config.resolver.blockList = [/\/__test__?\/.*/, /.*\.test\..*/, /.*\.spec\..*/];

module.exports = config;
