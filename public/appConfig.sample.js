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
      highPacketsLostThreshold: 5
    }
  }
};
