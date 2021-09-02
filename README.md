# Device Monitoring Plugin for Twilio Flex

This Twilio Flex plugin provides realtime monitoring of voice quality metrics provided by Twilio Voice Insights.

NOTE: The plugin requires the customer to license both Voice Insights and its Advanced Features capabilities, for which there is a charge.

## Setup

Make sure you have [Node.js](https://nodejs.org) as well as [`npm`](https://npmjs.com). We support Node >= 10.12 (and recommend the _even_ versions of Node). Afterwards, install the dependencies by running `npm install`:

```bash
cd plugin-device-monitoring

# If you use npm
npm install
```

### Serverless
The `plugin-serverless` sub-folder contains a single Serverless function, `respond-to-issue`.

## Configuration
The serverless function depends on two environment variables. A sample environment file, `.env.sample`, is located in the `plugin-serverless` subfolder. It should be copied to `.env` and then edited with the correct values.

Similarly, the client application depends on one environment variable, `REACT_APP_SERVERLESS_URI`. For this, the project contains a sample environment file, `.env.sample`, in the root folder. Again, it should be copied to `.env` for editing with the correct values. The value can be obtaied once the Serverless function has been deploed to the Twilio Serverless platform with the Serverless Toolkit. Note that this file provides so-called "React environment variables" whose names must start with the string, `REACT_APP_`.

The `DeviceMonitoringPlugin` namespace within the `attributes` property of the Flex configuration object is used to configure the plugin. The plugin monitors a handful of voice call quality metrics and goes into a warning condition when any of their values exceed the configured threshold value. At the end of the call, there are three configuration properties (`shortCallThreshold`,`endedInWarningIsTrigger`, `warningDurPctThreshold`) that determine whether an alert should be raised. Alerts can be triggered client-side (i.e., notify the agent) and/or an action can be taken server-side (e.g., raise an SNMP alarm).

```bash
  DeviceMonitoringPlugin: {
    alertAgent: [true|false],
    action: [string],
    highRttThreshold: [mSecs],
    highPacketsLostThreshold: [pct],
    lowMosThreshold: [number],
    highJitterThreshold: [mSecs],
    shortCallThreshold: [secs],
    endedInWarningIsTrigger: [true|false],
    warningDurPctThreshold: [number]
  }
```

The `alertAgent` boolean property indicates whether the agent should be alerted when a poor voice quality alert is triggered for a call. The default value is `false`.

The `action` property is used to specify the server-side action to be taken when a poor voice quality alert is triggered for a call. Currently, only two sample values (i.e., `log-call` and `send-sms-to-customer`) are recognized. The user of this plugin is expected to implement their own actions by enhancing or re-writing the `respond-to-issue` function. The default value is `log-call`.

The `highRttThreshold` property is used to set a limit on WebRTC round-trip times, in milliseconds, before a poor voice quality condition is triggered. The default value is `400`.

The `highPacketsLostThreshold` property is used to set a limit on packets lost, expressed as a percentage, before a poor voice quality condition is triggered. The default value is `70`.

The `lowMosThreshold` property is used to set a lower limit on MOS scores before a poor voice quality condition is triggered. The default value is `6`.

The `highJitterThreshold` property is used to set a limit on jitter, in milliseconds, before a poor voice quality condition is triggered. The default value is `30`.

The `shortCallThreshold` property is used to set a lower limit on call duration, in seconds, that warrants an alert. Often, a "short call" is indicative of a poor-quality voice connection that prompted either the customer or the agent to hang up quickly. Setting the value to zero will effectively disable this condition from triggering an alert. The default value is `10`.

The `endedInWarningIsTrigger` boolean property indicates whether a call ending while a warning condition is in progress warrants an alert. The default value is `false`.

The `warningDurPctThreshold` property is used to set an upper limit on the percentage of time that a call is under a warning condition before it warrants an alert. The default value is `15`.

See `appConfig.sample.js` for sample configuration data. For local development, use `appConfig.js` to configure the plugin. For a Twilio-hosted deployment, update the Flex configuration using the Flex API as described [here](https://www.twilio.com/docs/flex/ui/configuration#modifying-configuration-for-flextwiliocom). Here's an sample of calling the API via `curl` that can be used IF NO OTHER PLUGINS ARE CONFIGURED in the `attributes` property. As described in the document linked above, other plugins' configuration data can be preserved by first GETting the `attributes` data, editing the result to add in the `DeviceMonitoringPlugin` key, and then POSTing back the edited result.

```bash
curl https://flex-api.twilio.com/v1/Configuration -X POST -u ACxx:auth_token \
    -H 'Content-Type: application/json' \
    -d '{
        "account_sid": "ACxx",
        "attributes": {
          "DeviceMonitoringPlugin": {
            "action": "send-sms-to-customer",
            "alertAgent": "true",
            "highRttThreshold": 500
          }
        }
    }'
```

Run `twilio flex:plugins --help` to see all the commands currently supported by the Flex Plugins CLI. For further details refer to documentation on the [Flex Plugins CLI docs](https://www.twilio.com/docs/flex/developer/plugins/cli) page.

## Deploy
To deploy the function for this plugin, use the Twilio CLI and the Serverless Toolkit plugin while in the `plugin-serverless` folder. First, ensure that the CLI is using the correct Twilio project. You can verify that by running `twilio profiles:list`. The following command will deploy the function to a service in the Twilio Serverless environment:
```
twilio serverless:deploy
```

Use the generated service domain name as the value for `REACT_APP_SERVERLESS_URI` in the appropriate .env file in the parent (plugin) folder.

The plugin can be built and deployed with the `deploy` command of the Flex CLI. To be activated in your Flex project runnning at `flex.twilio.com` you must use the `release` command. This allows you to install this and, optionally, other Flex plugins together. Again, refer to the docs cited above for more information.

## Disclaimer
This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.
