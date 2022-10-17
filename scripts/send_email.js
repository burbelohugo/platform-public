const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const ses = new AWS.SES();

const fs = require('fs');

let template = fs.readFileSync('../users/email_template.html', 'utf8');
// template = template.replace('{header text}',);
template = template.replace('{body text}', `<div style='display: flex; justify-content: center'><img src='https://bitcamp-assets.s3.amazonaws.com/bitcamp.png' width='722px' height='150px'></div> 
<br/><br/>Hey Mackenzie, thanks for registering for Bitcamp 2021! 
<br /><br />Here's your custom referral link - you can win prizes and swag by having your friends use it to register for Bitcamp as well! 
<br /><br />http://gotechnica.org/r?r=389bb 
<br /><br />If you have any questions, just reply to this email. <br /><br />Best, The Bitcamp Organizing Team", /* required */`);

const params = {
  Destination: { /* required */
    ToAddresses: [
      'hello@bit.camp',
      /* more items */
    ],
  },
  Message: { /* required */
    Body: { /* required */
      Html: {
        Data: template,
      },
    },
    Subject: { /* required */
      Data: "You're Registered for Bitcamp 2021! Now Refer Your Friends...", /* required */
    },
  },
  ConfigurationSetName: 'platform_prod',
  Source: 'hello@bit.camp', /* required */
};
ses.sendEmail(params, (err, data) => {
  if (err) console.log(err, err.stack); // an error occurred
  else console.log(data); // successful response
});
