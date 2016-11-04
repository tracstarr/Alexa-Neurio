
## About the project

This project provides a step-by-step walkthrough to help you build a **hands-free** [Alexa Voice Service](https://developer.amazon.com/avs) (AVS) skill to connect to your [Neurio] (https://www.neur.io) power device. 

---

# Sample AWS Lambda function for Alexa
A simple [AWS Lambda](http://aws.amazon.com/lambda) function that demonstrates how to write a skill for the Amazon Echo using the Alexa SDK.

---

## Concepts
This application uses OAuth2 to connect and authentication with external hosted API by Neurio. This API is then used to query some simple information about your home energy usage. 

## Setup
To run this example skill you need to do two things. The first is to deploy the example code in lambda, and the second is to configure the Alexa skill to use Lambda.

### Neurio Setup
1. Login to [My Neurio](https://my.neur.io)
2. Go to Settings>Apps
3. Click Register New App
4. Enter in "Alexa Neurio" or similar for App Name.
5. Enter in Homepage url and fake callback url (will be updated later)
6. Click Register new app.
7. Copy down Client ID and Client Secret (to be used in Alexa Skill Setup)
8. Enter in Callback URL after step 10 of Alexa Skill Setup
9. Click update app.

### AWS Lambda Setup
1. Go to the AWS Console and click on the Lambda link. Note: ensure you are in us-east or you won't be able to use Alexa with Lambda.
2. Click on the Create a Lambda Function or Get Started Now button.
3. Skip the blueprint
4. Name the Lambda Function "Alexa-Neurio-Skill".
5. Select the runtime as Node.js
5. Go to the the src directory, select all files and then create a zip file, make sure the zip file does not contain the src directory itself, otherwise Lambda function will not work.
6. Select Code entry type as "Upload a .ZIP file" and then upload the .zip file to the Lambda
7. Keep the Handler as index.handler (this refers to the main js file in the zip).
8. Create a basic execution role and click create.
9. Leave the Advanced settings as the defaults.
10. Click "Next" and review the settings then click "Create Function"
11. Click the "Triggers" tab and click on "Add Trigger"
12. Select Alexa Skills kit and Enable it now. Click Submit.
13. Copy the ARN from the top right to be used later in the Alexa Skill Setup

### Alexa Skill Setup
1. Go to the [Alexa Console](https://developer.amazon.com/edw/home.html) and click Add a New Skill.
2. Set skill type to "Custom Interaction Model"
3. Set "Neurio Energy Monitor" as the skill name and "neurio" as the invocation name, this is what is used to activate your skill. For example you would say: "Alexa, ask Neurio to ..."
4. Copy the Intent Schema from the included IntentSchema.json.
5. Copy the Sample Utterances from the included SampleUtterances.txt. Click Next.
6. [optional] go back to the skill Information tab and copy the appId. Paste the appId into the index.js file for the variable APP_ID,
   then update the lambda source zip file with this change and upload to lambda again, this step makes sure the lambda function only    serves request from authorized source.
7. Select the Lambda ARN for the skill Endpoint and paste the ARN copied from above.
8. Select Account Linking "Yes"
9. Enter "Authorization URL" https://api.neur.io/v1/oauth2/authorize?response_type=code&state=alexa&redirect_uri=[url from Redirect on this page].
10. Authorization Grant Type should be set to "Auth Code Grant"
11. Access Token URI should be set to https://api.neur.io/v1/oauth2/token
12. Enter in your Client Id obtained from Neurio Setup.
13. Enter your Client Secret from Neurio setup.
14. You are now able to start testing your sample skill! You should be able to go to the [Echo webpage](http://echo.amazon.com/#skills) and see your skill enabled.
15. In order to test it, try to say some of the Sample Utterances.

## Examples
    User: "Alexa, ask neurio what the current power usage is"
    Alexa: "You're current power consumption is 1000 watts."
