exports.use = function(app) {
	// Utility packages.
	var _ = require("underscore");
	var assert = require("assert");
	var config = require("config");
	var util = require("util");

	// Geo.
	var geo = require("../geo/geo");
	var geolib = require("geolib")

	// Bitly
	var Bitly = require('bitly');

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
			userId: dbItem.userId,
			created: dbItem.created			
		};

		return item;
	};

	// Get all items.
	app.get("/items.json", function(req, res) {
		app.repository.getItems(function(err, dbItems) {
			if (err) {
				var message = util.format("Failed to get items. Error: %s", err.toString());

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
				userId: item.userId,
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
					app.repository.getUsersNear(latlng, 0.01, function(err, users) {
							if (err) {
								message = util.format("Failed to get users near item: %s.", item.title);
			
								console.error(err);
								core.sendApiError(message);

								return;
							}

							_.each(users, function(user) {
								if (user.id !== item.userId.toString())
								{
									var itemURL = util.format("http://www.flend.co/items/%s", item.id);

									var bitly = new Bitly(config.bitly.username, config.bitly.apikey);
									bitly.shorten(itemURL, function(err, response) {
										if (err) throw err;

										// See http://code.google.com/p/bitly-api/wiki/ApiDocumentation for format of returned object
										var short_url = response.data.url;

										// Do something with data
										var distance = geolib.convertUnit("mi", geolib.getDistance({latitude: latlng.lat, longitude: latlng.lng}, {latitude: user.geo[0], longitude: user.geo[1]}), 2);

										message = util.format("Flend.co: A new item request has been added %s miles from you. Item details: '%s'. Link: %s", distance, item.title, short_url);
										sms.sendSms(user.mobileNumber, message);
									});
								}
							});
						});
				}, 0);

				core.sendJsonResponse(core.HttpStatus.OK, res, item);
			});
		});
	});
};
