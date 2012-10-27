exports.use = function(app) {
	// Utility packages.
	var util = require("util");

	// API core.
	var core = require("./core").use(app);

	app.post("/users.json", function(req, res) {
		/*
		console.dir(req.body);
		res.send("");
		return;
		*/

		var message;
		var user = req.body.user;

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
