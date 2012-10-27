exports.use = function(app) {
	var _HttpStatus = {
		OK: 200,
		BadRequest: 400,
		NotFound: 404,
		ServerError: 500
	};

	var _sendJsonResponse = function(status, res, response) {
		res.type("application/json");
		res.json(status, response);
	};	

	var _sendApiError = function(res, message) {
		var error = {
			name: "ApiError",
			message: message
		};

		_sendJsonResponse(_HttpStatus.BadRequest, res, error);
	};

	var _sendNotFoundError = function(res, message) {
		var error = {
			name: "NotFoundError",
			message: message
		};

		_sendJsonResponse(_HttpStatus.NotFound, res, error);
	};

	app.get("/", function(req, res) {
		res.send("This is a Node.js application.");
	});

	app.get("/ping.json", function(req, res) {
		var response = {
			ping: "pong",
			now: new Date()
		};

		_sendJsonResponse(_HttpStatus.OK, res, response);
	});

	// Object exports.
	exports.HttpStatus = _HttpStatus;

	// Function exports.
	exports.sendJsonResponse = _sendJsonResponse;
	exports.sendApiError = _sendApiError;
	exports.sendNotFoundError = _sendNotFoundError;

	return this;
};
