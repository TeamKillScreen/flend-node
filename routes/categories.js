exports.use = function(app) {
	// Utility packages.
	var _ = require("underscore");
	var util = require("util");

	// API core.
	var core = require("./core").use(app);

	var _mapDbCategoryToCategory = function(dbCategory) {
		console.dir(dbCategory);

		var category = {
			id: dbCategory._id,
			description: dbCategory.description
		};

		return category;
	};

	// Get all categories.
	app.get("/categories.json", function(req, res) {
		app.repository.getCategories(function(err, dbCategories) {
			if (err) {
				var message = util.format("Failed to get categories.");

				console.error(err);
				core.sendApiError(message);

				return;
			}

			var categories = [];

			_.each(dbCategories, function(dbCategory) {
				var category = _mapDbCategoryToCategory(dbCategory);

				categories.push(category);
			});

			core.sendJsonResponse(core.HttpStatus.OK, res, categories);
		});
	});
};
