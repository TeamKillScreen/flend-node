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

	// Get all items.
	app.post("/items.json", function(req, res) {
		var message;
		var item = req.body.item;

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
