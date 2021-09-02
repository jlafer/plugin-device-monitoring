/*
  This is a sample function that responds to a call with serious voice quality issues.
  The basic idea is that when a customer experiences very poor call-quality,
  an automated response of some type may be in order. Possibilities include logging to
  a network monitoring system, placing a callback to the customer, sending a text, etc.

  This particular sample shows how to send an SMS to the customer - for demo purposes only.

  Required input (event) body:
    issues - a string with the names of one or more voice quality issues
    callerId - the customer's callerId for the call experiencing issues
    dnis - the number called by the customer
    action - the action-name to take in response to the issue
*/
const TokenValidator = require('twilio-flex-token-validator').functionValidator;
const {corsResponse} = require('jlafer-twilio-runtime-util');

exports.handler = TokenValidator(async (context, event, callback) => {
  const response = corsResponse();
  const client = context.getTwilioClient();
  try {
    const {callerId, dnis, issues, action} = event;
    console.log(`action = ${action}`);
    console.log(`dnis = ${dnis}`);
    console.log(`callerId = ${callerId}`);
    console.log(`issues = ${issues}`);
    switch (action) {
      case 'log-call':
        // implement your own logging here
        break;
      case 'send-sms-to-customer':
        // perhaps send a text and invite the caller to try again
        const text = `It looks like your call to us may have had issues. If so, please try us again.`
        await client.messages.create({from: `${dnis}`, to: `${callerId}`, body: text});
        break;
    }
    response.setStatusCode(200);
    response.appendHeader("Content-Type", "application/json");
    response.setBody({data: 'success'});
    callback(null, response);
  }
  catch (err) {
    console.log(`respond-to-issue: caught ERROR: ${err}`);
    callback(err, response);
  }
});
