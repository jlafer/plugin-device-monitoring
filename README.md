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
The `plugin-serverless` sub-folder contains a few Serverless functions.

The `get-sync-token` function provides the client with a Sync token.

## Configuration
The serverless functions depend on a set of environment variables. Those are documented in the module comment-block inside `get-sync-token.js`. A sample environment file, `.env.sample`, is located in the `plugin-device-monitoring-fns` subfolder. It should be copied to `.env` and then edited with the correct values.

Similarly, the client application depends on environment variables during development and testing against the local web server. These variables are also used when the plugin is built and deployed to the Twilio cloud (see below). For this, the project contains a sample environment file, `.env.sample`, in the root folder. Again, it should be copied to `.env` for editing with the correct values. Note that this file provides so-called "React environment variables" whose names must start with the string, `REACT_APP_`.

The `DeviceMonitoringPlugin` namespace within the `attributes` property of the Flex configuration object is used to configure the plugin. 

```bash
  DeviceMonitoringPlugin: {
    alertAgent: [`true`|`false`],
    highRttThreshold: [mSecs],
    highPacketsLostThreshold: [pct],
    lowMosThreshold: [number],
    highJitterThreshold: [mSecs]
  }
```

The `alertAgent` boolean property indicates whether the agent should be alerted when a poor voice quality threshold is breached. Threshold levels and conditions can configured, based on various Voice Insights voice warning events. The default value is `false`.

The `highRttThreshold` property is used to set a limit on WebRTC round-trip times, in milli-seconds, before the poor voice quality condition is triggered. The default value is `400`.

The `highPacketsLostThreshold` property is used to set a limit on packets lost, expressed as a percentage, before the poor voice quality condition is triggered. The default value is `70`.

The `lowMosThreshold` property is used to set a lower limit on MOS scores before the poor voice quality condition is triggered. The default value is `6`.

The `highJitterThreshold` property is used to set a limit on jitter, in milli-seconds, before the poor voice quality condition is triggered. The default value is `30`.

See `appConfig.example.js` for sample configuration data. For local development, use `appConfig.js` to configure the plugin. For a Twilio-hosted deployment, update the Flex configuration using the Flex API as described [here](https://www.twilio.com/docs/flex/ui/configuration#modifying-configuration-for-flextwiliocom). Here's an example of calling the API via `curl` that can be used IF NO OTHER PLUGINS ARE CONFIGURED in the `attributes` property. As described in the document linked above, other plugins' configuration data can be preserved by first GETting the `attributes` data, editing the result to add in the `DeviceMonitoringPlugin` key, and then POSTing back the edited result.

```bash
curl https://flex-api.twilio.com/v1/Configuration -X POST -u ACxx:auth_token \
    -H 'Content-Type: application/json' \
    -d '{
        "account_sid": "ACxx",
        "attributes": {
          "DeviceMonitoringPlugin": {
            "alertAgent": "true",
            "highRttThreshold": 500
          }
        }
    }'
```

Run `twilio flex:plugins --help` to see all the commands currently supported by the Flex Plugins CLI. For further details refer to documentation on the [Flex Plugins CLI docs](https://www.twilio.com/docs/flex/developer/plugins/cli) page.

## Deploy
The plugin can be built and deployed with the `deploy` command of the Flex CLI. To be activated in your Flex project runnning at `flex.twilio.com` you must use the `release` command. This allows you to install this and, optionally, other Flex plugins together. Again, refer to the docs cited above for more information.

