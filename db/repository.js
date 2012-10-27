exports.connect = function() {
	// Utility packages.
	var config = require("config");
	var util = require("util");

	// Mongoose.
	var mongoose = require("mongoose");

	// util.format('%s:%s', 'foo'); // 'foo:%s'

	var db = mongoose.createConnection(config.mongolab.connectionString);

	// Define database schema.
	var itemSchema = mongoose.Schema({
		title: String,
		description: String,
		category: String,
		tags: [ String ],
		created: Date,
		updated: Date
	});

	var _Item = db.model("Item", itemSchema);

	var _addItem = function(item, next) {
		item.save(function(err) {
			next(err);
		});
	};

	var _getItems = function(next) {
		var query = {};

		return _Item.find(query, function(err, people) {
			next(err, people);
		});
	};

	var repository = {
		// Database.
		db: db,

		// Items.
		Item: _Item,
		addItem: _addItem,
		getItems: _getItems
	};

	return repository;
};
