exports.use = function(app) {
	// Utility packages.
	var assert = require("assert");
	var util = require("util");

	// API core.
	var core = require("./core").use(app);

	// Geo.
	var geo = require("../geo/geo");

	var _mapDbUserToUser = function(dbUser) {
		var user = {
			id: dbUser._id,
			username: dbUser.username,
			firstName: dbUser.firstName,
			lastName: dbUser.lastName,
			mobileNumber: dbUser.mobileNumber,
			emailAddress: dbUser.emailAddress,
			postcode: dbUser.postcode,
			lat: dbUser.geo[0],
			lng: dbUser.geo[1],
			categories: dbUser.categories,
			created: dbUser.created,
			updated: dbUser.updated	
		};

		return user;
	};

	app.put("/users/:id.json", function(req, res) {
		var message;
		var id = req.params.id;
		var user = req.body.user;

		assert.ok(id);

		geo.getPostcodeLatLng(user.postcode, function(err, latlng) {
			if (err) {
				message = util.format("Failed to get latlng from postcode %s.", user.postcode);

				console.error(error);
				core.sendApiError(message);

				return;
			}

			app.repository.getUser(id, function(err, dbUser) {
				if (err) {
					message = util.format("Failed to get user by id %s.", id);

					console.error(error);
					core.sendApiError(message);

					return;
				}

				dbUser.firstName = user.firstName;
				dbUser.lastName = user.lastName;
				dbUser.mobileNumber = user.mobileNumber;
				dbUser.emailAddress = user.emailAddress;
				dbUser.postcode = user.postcode;
				dbUser.geo = [
					latlng.lat,
					latlng.lng
				],
				dbUser.categories = user.categories;

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

		assert.ok(user);

		var username = user.username;

		assert.ok(username);

		app.repository.getUserByName(username, function(err, dbUser) {
			if (err) {
				message = util.format("User not found: %s.", user.username);

				console.error(error);
				core.sendApiError(message);

				return;
			}

			user = _mapDbUserToUser(dbUser);

			core.sendJsonResponse(core.HttpStatus.OK, res, user);
		});
	});
};
