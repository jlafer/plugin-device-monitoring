export function verifyAndFillConfiguration(cfg) {
  const pluginName = 'DeviceMonitoringPlugin';
  if (! cfg)
    throw new Error(`${pluginName}: attributes.${pluginName} NOT configured. See README for instructions.`);
  const alertAgent = !!cfg.alertAgent ? cfg.alertAgent : false;
  const highRttThreshold = !!cfg.highRttThreshold ? cfg.highRttThreshold : 400;
  const highPacketsLostThreshold = !!cfg.highPacketsLostThreshold ? cfg.highPacketsLostThreshold : 3;
  const lowMosThreshold = !!cfg.lowMosThreshold ? cfg.lowMosThreshold : 3.5;
  const highJitterThreshold = !!cfg.highJitterThreshold ? cfg.highJitterThreshold : 30;
  return {alertAgent, highRttThreshold, highPacketsLostThreshold, lowMosThreshold, highJitterThreshold};
}
