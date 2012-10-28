// Utility packages.
var assert = require("assert");
var url = require("url");
var util = require("util");

// File system.
var fs = require("fs");

// Config.
var config = require("config");

// Request.
var request = require("request");

// Read XML template file.
var buffer = fs.readFileSync("sms/template.xml");
var template = buffer.toString();

var _handleResponse = function(error, response, body, next) {
	var errorMessage;

	assert.ok(next, "next");

	if (error) {
		errorMessage = "Failed with error.";

	} else if (!response) {
		errorMessage = "Failed with no response.";

	} else if (response.statusCode != 200) {
		errorMessage = util.format("Failed with status code %d.", response.statusCode);

	} else if (!body) {
		errorMessage = "Failed with no body.";	

	}

	if (errorMessage) {
		next({
			message: errorMessage,
			error: error,
			response: response,
			body: body
		});

	} else {
		next(null, body);
	}
};

var _sendSms = function(mobileNumber, message) {
	var xml = util.format(
		template.toString(),
		config.esendex.accountreference,
		mobileNumber,
		message);

	console.log("sms ->");
	console.log(xml);

	var auth = util.format("%s:%s",
		config.esendex.username,
		config.esendex.password);

	console.log(auth);

	var endpoint = url.format({
		protocol: "https",
		hostname: "api.esendex.com",
		pathname: "v1.0/messagedispatcher"
	});

	var headers = {
		"content-type": "application/xml",
		"authorization": "Basic"
	};

	var parseResponse = function(error, response) {
		if (error) {
			// console.dir(error);

		} else {
			// console.dir(response);

		}
	};

	// Richard
	// https://github.com/mikeal/request
	request.post({
		headers: headers,
		url: endpoint,
		body: xml,
		auth: auth
	}, function(error, response, body) {
		_handleResponse(error, response, body, parseResponse);
	});
};

exports.sendSms = _sendSms;
