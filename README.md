# Twilio Flex Plugin Template

This is a template Twilio Flex Plugin, demonstrating many of the typical coding chores that are required when building a plugin.

## Setup

Make sure you have [Node.js](https://nodejs.org) as well as [`npm`](https://npmjs.com). We support Node >= 10.12 (and recommend the _even_ versions of Node). Afterwards, install the dependencies by running `npm install`:

```bash
cd plugin-device-monitoring

# If you use npm
npm install
```

### Client UI
The template contains code for a variety of use cases. Some should be useful generally whereas other code will demonstrate a technique but you will need to make changes to suit your particulars. For example, it demonstrates showing a CRM in Panel2 and it does this with Hubspot. So you will probably need to modify this part of the template.

### Serverless
The `plugin-device-monitoring-fns` sub-folder contains sample Serverless functions. You will probably want to rename this folder (or remove it if you don't need any Serverless functions).

The `get-sync-token` function provides the client with a Sync token as part of demonstrating the use of Twilio Sync.

## Configuration
The serverless functions depend on a set of environment variables. Those are documented in the module comment-block inside `get-sync-token.js`. A sample environment file, `.env.sample`, is located in the `plugin-device-monitoring-fns` subfolder. It should be copied to `.env` and then edited with the correct values.

Similarly, the client application depends on environment variables during development and testing against the local web server. These variables are also used when the plugin is built and deployed to the Twilio cloud (see below). For this, the project contains a sample environment file, `.env.sample`, in the root folder. Again, it should be copied to `.env` for editing with the correct values. Note that this file provides so-called "React environment variables" whose names must start with the string, `REACT_APP_`.

Run `twilio flex:plugins --help` to see all the commands currently supported by the Flex Plugins CLI. For further details refer to documentation on the [Flex Plugins CLI docs](https://www.twilio.com/docs/flex/developer/plugins/cli) page.

## Deploy
The plugin can be built and deployed with the `deploy` command of the Flex CLI. To be activated in your Flex project runnning at `flex.twilio.com` you must use the `release` command. This allows you to install this and, optionally, other Flex plugins together. Again, refer to the docs cited above for more information.

