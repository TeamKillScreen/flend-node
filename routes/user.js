exports.use = function(app) {
	// Utility packages.
	var util = require("util");

	// API core.
	var core = require("./core").use(app);

	app.post("/user.json", function(req, res) {
		var user = req.body.user;
		var message;

		console.dir(core);

		// Username and password.
		switch (user.username) {
			case "alice":
				core.sendJsonResponse(core.HttpStatus.OK, res, {
					id: "1",
					username: user.username,
					firstName: "Alice",
					lastName: "Arnold"
				});

				break;

			case "bob":
				core.sendJsonResponse(core.HttpStatus.OK, res, {
					id: "2",
					username: user.username,
					firstName: "Bob",
					lastName: "Baggins"
				});

				break;

			default:
				message = util.format("User not found: %s.", user.username);
				core.sendNotFoundError(res, message);

				break;
		}
	});
};
