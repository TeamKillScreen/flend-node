exports.use = function(app) {
	// API core.
	var core = require("./core");

	// Get all items.
	app.get("/items", function(req, res) {
		app.repository.getItems(function(err, items) {
			if (err) {
				var message = util.format("Failed to get items.")

				console.error(err);
				core.sendApiError(message)

				return;
			}

			core.sendJsonResponse(core.HttpStatus.OK, res, items);
		});
	});
};
