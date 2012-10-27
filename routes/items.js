exports.use = function(app) {
	// Utility packages.
	var _ = require("underscore");
	var util = require("util");

	// API core.
	var core = require("./core").use(app);

	var _mapDbItemToItem = function(dbItem) {
		var item = {
			id: dbItem._id,
			title: dbItem.title,
			description: dbItem.description,
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
		var id = req.params.id;

		console.log("100 ->");
		console.dir(id);

		app.repository.getItem(id, function(err, dbItem) {
			if (err) {
				var message = util.format("Failed to get item id %s.", id);

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

		var dbItem = new app.repository.Item({
			title: item.title,
			description: item.description,
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

			core.sendJsonResponse(core.HttpStatus.OK, res, item);
		});
	});

	// Attach photo to item.
	app.post("/items/:id/photos.json", function(req, res) {
		var message;
		var photo = req.body.photo;

		var dbItem = new app.repository.Item({
			title: item.title,
			description: item.description,
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

			var item = _mapDbItemToItem(dbItem);

			core.sendJsonResponse(core.HttpStatus.OK, res, item);
		});
	});
};
