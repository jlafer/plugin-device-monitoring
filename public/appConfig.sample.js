//TODO add in configuration once stable
var appConfig = {
  pluginService: {
    enabled: true,
    url: '/plugins',
  },
  ytica: false,
  logLevel: 'info',
  showSupervisorDesktopView: true,
  enableReduxLogging: true,
  attributes: {
    DeviceMonitoringPlugin: {
      alertAgent: true,
      action: 'send-sms-to-customer',
      highRttThreshold: 500,
      highPacketsLostThreshold: 5,
      lowMosThreshold: 5,
      highJitterThreshold: 30,
      shortCallThreshold: 15,
      endedInWarningIsTrigger: true,
      warningDurPctThreshold: 10
    }
  }
};
