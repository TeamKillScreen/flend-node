exports.use = function(app) {
	// Utility packages.
	var util = require("util");

	// API core.
	var core = require("./core").use(app);

	var _mapDbUserToUser = function(dbUser) {
		var user = {
			id: dbUser._id,
			username: dbUser.username,
			firstName: dbUser.firstName,
			lastName: dbUser.lastName,
			mobileNumber: dbUser.mobileNumber,
			emailAddress: dbUser.emailAddress,
			tags: dbUser.tags,
			created: dbUser.created,
			updated: dbUser.updated	
		};

		return user;
	};

	app.put("/users/:id.json", function(req, res) {
		var message;
		var user = req.body.users;

		geo.getPostcodeLatLng(user.postcode, function(error, latlng) {
			if (error) {
				message = util.format("Failed to get latlng from postcode %s.", user.postcode);

				console.error(error);
				core.sendApiError(message);

				return;
			}

			db.repository.getUser(id, function(err, dbUser) {
				if (error) {
					message = util.format("Failed to get user by id %s.", id);

					console.error(error);
					core.sendApiError(message);

					return;
				}

				dbUser.firstName = user.firstName;
				dbUser.lastName = user.lastName;
				dbUser.mobileNumber = user.mobileNumber;
				dbUser.emailAddress = user.emailAddress;
				dbUser.lat = latlng.lat;
				dbUser.lng = latlng.lng;

				app.repository.updateUser(dbUser, function(err) {
					if (err) {
						message = util.format("Failed to update user: %s.", user.username);

						console.error(err);
						core.sendApiError(message);

						return;
					}

					user = _mapDbUserToUser(dbUser);

					core.sendJsonResponse(core.HttpStatus.OK, res, user);
				});
			});
		});
	});

	app.post("/users.json", function(req, res) {
		var message;
		var user = req.body.user;
		var username = user.username.toLowerCase();

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

			case "carl":
				core.sendJsonResponse(core.HttpStatus.OK, res, {
					id: "508c6efee4b0c86b6b5eac4b",
					username: user.username,
					firstName: "Carl",
					lastName: "Smith"
				});

				break;

			default:
				message = util.format("User not found: %s.", user.username);
				core.sendNotFoundError(res, message);

				break;
		}
	});
};
