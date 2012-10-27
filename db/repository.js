exports.connect = function() {
	// Utility packages.
	var config = require("config");
	var util = require("util");

	// GridFS.
	var Grid = require('gridfs-stream');
	var gridfs;

	// Mongoose.
	var mongoose = require("mongoose");

	// util.format('%s:%s', 'foo'); // 'foo:%s'

	var db = mongoose.createConnection(config.mongolab.connectionString);

	// GridFS.
	db.once("open", function() {
		// TODO: db.db.
		_gridfs = Grid(db.db, mongoose.mongo);
	});
	
	// Define database schema.
	var itemSchema = mongoose.Schema({
		title: String,
		description: String,
		category: String,
		tags: [ String ],
		created: Date,
		updated: Date
	});

	// ---------- Items ----------
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

	var _getItem = function(id, next) {
		console.dir(id);
		
		var query = { _id: id };

		return _Item.findOne(query, function(err, item) {
			console.dir(err);
			console.dir(item);

			next(err, item);
		});		
	};

	// ---------- Photos ----------
	/*
	var photoSchema = mongoose.Schema({
		_itemId: ObjectId
	});

	var _Photo = db.model("Photo", photoSchema);
	*/

	// ---------- Categories ----------
	var categorySchema = mongoose.Schema({
		description: String
	});

	var _Category = db.model("Category", categorySchema);

	var _getCategories = function(next) {
		var query = {};

		return _Category.find(query, function(err, categories) {
			next(err, categories);
		});
	};

	var repository = {
		// Database.
		db: db,

		// Items.
		Item: _Item,
		addItem: _addItem,
		getItems: _getItems,
		getItem: _getItem,

		// Categories.
		Category: _Category,
		getCategories: _getCategories
	};

	return repository;
};
