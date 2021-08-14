const DotEnvWebpack = require('dotenv-webpack');

module.exports = (config, { isProd, isDev, isTest }) => {
  /**
   * Customize the webpack by modifying the config object.
   * Consult https://webpack.js.org/configuration for more information
   */
  // change the path to the .env that contains the file corresponding to the active Twilio CLI profile
  const envPath = `.env.${process.env.TWILIO_PROFILE}`;
  if (envPath) {
    config.plugins.push(
      new DotEnvWebpack( {path: envPath} )
    );
  }
  return config;
}