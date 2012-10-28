exports.use = function(app) {
	// Utility packages.
	var _ = require("underscore");
	var assert = require("assert");
	var config = require("config");
	var util = require("util");

	// Geo.
	var geo = require("../geo/geo");

	// API core.
	var core = require("./core").use(app);

	// Pusher API.
	var Pusher = require("node-pusher");

	// Esendex API.
	var sms = require("../sms/sms");

	var pusher = new Pusher({
		appId: config.pusher.appId,
		key: config.pusher.key,
		secret: config.pusher.secret
	});

	var _mapDbItemToItem = function(dbItem) {
		var item = {
			id: dbItem._id,
			title: dbItem.title,
			description: dbItem.description,
			postcode: dbItem.postcode,
			lat: dbItem.geo[0],
			lng: dbItem.geo[1],
			radius: dbItem.radius,
			category: dbItem.category,
			tags: dbItem.tags,
			created: dbItem.created			
		};

		return item;
	};

	// Get all items.
	app.get("/items.json", function(req, res) {
		app.repository.getItems(function(err, dbItems) {
			if (err) {
				var message = util.format("Failed to get items.");

				console.error(err);
				core.sendApiError(message);

				return;
			}

			var items = [];

			_.each(dbItems, function(dbItem) {
				var item = _mapDbItemToItem(dbItem);

				items.push(item);
			});

			core.sendJsonResponse(core.HttpStatus.OK, res, items);
		});
	});

	// Get item by id.
	app.get("/items/:id.json", function(req, res) {
		var message;
		var id = req.params.id;

		console.log("100 ->");
		console.dir(id);

		app.repository.getItem(id, function(err, dbItem) {
			if (err) {
				message = util.format("Failed to get item id %s.", id);

				console.error(err);
				core.sendApiError(message);

				return;
			}

			console.log("200 ->");
			console.log(dbItem);

			var item = _mapDbItemToItem(dbItem);

			core.sendJsonResponse(core.HttpStatus.OK, res, item);
		});
	});

	// Add item.
	app.post("/items.json", function(req, res) {
		var message;
		var item = req.body.items;

		assert.ok(item);
		assert.ok(item.postcode);

		geo.getPostcodeLatLng(item.postcode, function(error, latlng) {
			if (error) {
				message = util.format("Failed to get latlng from postcode %s.", item.postcode);

				console.error(error);
				core.sendApiError(message);

				return;
			}

			var dbItem = new app.repository.Item({
				title: item.title,
				description: item.description,
				geo: [
					latlng.lat,
					latlng.lng
				],
				postcode: item.postcode,
				category: item.category,
				tags: item.tags,
				created: new Date()
			});

			app.repository.addItem(dbItem, function(err) {
				if (err) {
					message = util.format("Failed to add item: %s.", item.title);

					console.error(err);
					core.sendApiError(message);

					return;
				}

				item = _mapDbItemToItem(dbItem);

				// Push the message asap.
				setTimeout(function() {
					pusher.trigger("flend", "newItem", item);
				}, 0);

				// Find 'interested' users nearby.
				setTimeout(function() {
					var users = app.repository.getUsersNear(latlng, 0.01, function(err, users) {
							if (err) {
								message = util.format("Failed to get users near item: %s.", item.title);
			
								console.error(err);
								core.sendApiError(message);

								return;
							}

							_.each(users, function(user) {
								message = util.format("New item '%s'.", item.title);
								sms.sendSms(user.mobileNumber, message);
							});
						});
				}, 0);

				core.sendJsonResponse(core.HttpStatus.OK, res, item);
			});
		});
	});
};
