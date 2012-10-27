// Utility packages.
var assert = require("assert");
var url = require("url");
var util = require("util");

// Request.
var request = require("request");

function _handleResponse(error, response, body, next) {
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
}

exports.getPostcodeLatLng = function(postcode, next) {
	// postcode = postcode.replace(/\s+/g, " ");

	var q = util.format("%s,+UK", postcode);

	var endpoint = url.format({
		protocol: "http",
		hostname: "maps.google.com",
		pathname: "maps/geo",
		query: {
			q: q,
			output: "json",
			sensor: false
		}
	});

	var parseResponse = function(error, response) {
		// console.dir(arguments);

		if (error) {
			console.dir(error);
			next(error);

		} else {
			console.dir(response);

			var placemark = response.Placemark[0];
			var point = placemark.Point;
			var coordinates = point.coordinates;

			next(null, { 
				lat: coordinates[1],
				lng: coordinates[0]
			});
		}
	};

	var options = {
		url: endpoint,
		json: true
	};

	request(options, function(error, response, body) {
		_handleResponse(error, response, body, parseResponse);
	});
};
