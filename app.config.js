module.exports = function (config) {
  // Expo passes { config } where config is the static app.json expo. Preserve full config for standalone APK.
  const base = config?.config ?? {};
  const expo = { ...base, scheme: base.scheme ?? 'rork-app' };
  return { expo };
};
