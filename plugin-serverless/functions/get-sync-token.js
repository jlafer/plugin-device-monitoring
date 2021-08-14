/*
  This function returns a Twilio Sync authorization token.
  Required context variables:
    ACCOUNT_SID - the SID of the Twilio account
    TWILIO_SYNC_SERVICE - the SID of the target Sync Service
    TWILIO_API_KEY_SID - the SID of an API Key used to call the Twilio Identity API
    TWILIO_API_KEY_SECRET - the secreat associated with the API Key
  Required input (event) body:
    Identity - the identity of the user for the token
    Token - the Flex token that provides proof of authentication for this request
*/
const TokenValidator = require('twilio-flex-token-validator').functionValidator;
const {checkEnvVariable, corsResponse} = require('jlafer-twilio-runtime-util');
let path = Runtime.getFunctions()['fns-helpers'].path;
let helpers = require(path);

exports.handler = TokenValidator((context, event, callback) => {
  const response = corsResponse();
  try {
    const envVars = helpers.getAndVerifyEnvVars(context);
    const ACCOUNT_SID = checkEnvVariable(context, 'ACCOUNT_SID');

    const IDENTITY = event.Identity;

    const AccessToken = Twilio.jwt.AccessToken;
    const SyncGrant = AccessToken.SyncGrant;

    const syncGrant = new SyncGrant({
      serviceSid: envVars.TWILIO_SYNC_SERVICE
    });

    const accessToken = new AccessToken(
      ACCOUNT_SID, envVars.TWILIO_API_KEY_SID, envVars.TWILIO_API_KEY_SECRET
    );
    accessToken.addGrant(syncGrant);
    accessToken.identity = IDENTITY;

    response.setStatusCode(200);
    response.appendHeader("Content-Type", "application/json");
    response.setBody({token: accessToken.toJwt()});
    callback(null, response);
  }
  catch (err) {
    console.log(`get-sync-token: caught ERROR: ${err}`);
    callback(err, response);
  }
});
