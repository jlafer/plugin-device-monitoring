const {
  checkEnvVariable
} = require('jlafer-twilio-runtime-util');

function getAndVerifyEnvVars(context) {
  const envVars = {};
  envVars.TWILIO_API_KEY_SID = checkEnvVariable(context, 'TWILIO_API_KEY_SID');
  envVars.TWILIO_API_KEY_SECRET = checkEnvVariable(context, 'TWILIO_API_KEY_SECRET');
  envVars.TWILIO_SYNC_SERVICE = checkEnvVariable(context, 'TWILIO_SYNC_SERVICE');
  return envVars;
}

exports.getAndVerifyEnvVars = getAndVerifyEnvVars;
