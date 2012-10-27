exports.use = function(app) {
	// Utility packages.
	var util = require("util");

	// API core.
	var core = require("./core").use(app);

	// Get all items.
	app.get("/items.json", function(req, res) {
		app.repository.getItems(function(err, items) {
			if (err) {
				var message = util.format("Failed to get items.");

				console.error(err);
				core.sendApiError(message);

				return;
			}

			core.sendJsonResponse(core.HttpStatus.OK, res, items);
		});
	});

	// Get all items.
	app.post("/items.json", function(req, res) {
		var message;
		var item = req.body.items;

		var dbItem = new db.Item({
			title: item.title,
			description: item.description,
			category: item.category,
			tags: item.tags
		});

		app.repository.addItem(function(err) {
			if (err) {
				message = util.format("Failed to add item: %s.", item.title);

				console.error(err);
				core.sendApiError(message);

				return;
			}

			console.log(dbItem);

			core.sendJsonResponse(core.HttpStatus.OK, res, {
				status: "OK"});
		});
	});
};
