

/**
 * App ID for the skill
 */
var APP_ID = "" //enter app id here; 

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var alexaDateUtil = require('./alexaDateUtil');
var https = require('https');

/**
 * Neurio is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var Neurio = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Neurio.prototype = Object.create(AlexaSkill.prototype);
Neurio.prototype.constructor = Neurio;

Neurio.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("Neurio onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

Neurio.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("Neurio onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to Neurio. I'm keeping track of your power usage.";
    var repromptText = "You can say current power consumption.";
    response.ask(speechOutput, repromptText);
};

Neurio.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("Neurio onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

Neurio.prototype.intentHandlers = {
    // register custom intent handlers
    "GetEnergyStats": function (intent, session, response) {
		handleIntent(session, response, handleGetEnergyStats);				
    },
	"GetAlwaysOn": function (intent, session, response) {
		handleIntent(session, response, handleGetAlwaysOn);				
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
		 handleHelpRequest(response);        
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

function handleHelpRequest(response) {
    var repromptText = "Would you like your current power consumption?";
    var speechOutput = "I can help you with your Neurio. " + repromptText;

    response.ask(speechOutput, repromptText);
}

function handleIntent(session, response, apiCall) {
		
	if(!session.user.accessToken) { 
		response.tellWithLinkAccount("You must have a Neurio account to use this skill. Please use the Alexa app to link your Amazon account with your Neurio Account.");	
	}	
	
	if (!session.attributes.sensorId)
	{		
		api('currentUser', session, function responseCallback(err, apiResponse) {
			var speechOutput;
			
			if (err) {
				speechOutput = "Sorry, Neurio service is experiencing a problem. Please try again later";
				response.tellWithCard(speechOutput, "Neurio", speechOutput);
			} else {
				extractToSession(session, apiResponse);
				console.log("Your sensor Id has been found. " + session.attributes.sensorId);							
				apiCall(session, response);
			}
		});
	}
	else {
		console.log("Session exists with sensorId");
		apiCall(session, response);
	}	
}

function api(request, session, responseCallback) {
	
	var options = {
		hostname: 'api.neur.io',
		path: '',	
		headers: {
			'Content-Type':'application/json',
			'Authorization':'Bearer ' + session.user.accessToken,
		}		
	};
		
	if (request === 'currentUser') {
		options.path = '/v1/users/current';
	}
	else if (request === 'lastSample') {
		options.path = '/v1/samples/live/last?sensorId=' + session.attributes.sensorId;
	}
	
	https.get(options, function (res) {
		var responseString = '';
		console.log('Status Code: ' + res.statusCode);

		if (res.statusCode != 200) {
			responseCallback(new Error("Non 200 Response"));
		}

		res.on('data', function (data) {
			responseString += data;
		});

		res.on('end', function () {
			var neurioResponseObject = JSON.parse(responseString);

			if (neurioResponseObject.errors) {
				console.log("Neurio error: " + neurioResponseObject.message);
				responseCallback(new Error(neurioResponseObject.message));
			} else {				
				responseCallback(null, neurioResponseObject);
			}
		});
	}).on('error', function (e) {
		console.log("Communications error: " + e.message);	
		responseCallback(new Error(e.message));
	});	
}

function handleGetEnergyStats(session, response) {
	var speechOutput;
	
	if (!session.attributes.sensorId) {
		speechOutput = "Sorry, I could not find a Neurio sensor.";
		response.tellWithCard(speechOutput, "Neurio", speechOutput);
	} else {
		api('lastSample', session, function responseCallback(err, apiResponse) {
		var speechOutput;

		if (err) {
			speechOutput = "Sorry, Neurio service is experiencing a problem. Please try again later";
			response.tellWithCard(speechOutput, "Neurio", speechOutput);
		} else {
			console.log("Api Response " + apiResponse);			
			speechOutput = "Your current Power Consumption is " + apiResponse.consumptionPower + " watts.";
			response.tellWithCard(speechOutput, "Neurio", speechOutput);
		}
		});
	}
	
}

function handleGetAlwaysOn(session, response) {
	var speechOutput;
	
	if (!session.attributes.sensorId) {
		speechOutput = "Sorry, I could not find a Neurio sensor.";
		response.tellWithCard(speechOutput, "Neurio", speechOutput);
	} else {
		api('currentUser', session, function responseCallback(err, apiResponse) {
		var speechOutput;

		if (err) {
			speechOutput = "Sorry, Neurio service is experiencing a problem. Please try again later";
			response.tellWithCard(speechOutput, "Neurio", speechOutput);
		} else {
			console.log("Api Response " + apiResponse);			
			speechOutput = "Your current always on power consumption is " + parseInt(apiResponse.locations[0].alwaysOn[1].score) + " watts.";
			response.tellWithCard(speechOutput, "Neurio", speechOutput);
		}
		});
	}
}

function extractToSession(session, jsonObj) {
	session.attributes.sensorId = jsonObj.locations[0].sensors[0].sensorId;	
	session.attributes.location = jsonObj.locations[0].name;		
}


// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Neurio skill.
    var neurio = new Neurio();
    neurio.execute(event, context);
};

