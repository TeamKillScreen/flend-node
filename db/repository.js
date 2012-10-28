// TODO: err versus error.
// TODO: handle errors and return.
// TODO: refactor into repository per object type.

exports.connect = function() {
	// Utility packages.
	var assert = require("assert");
	var config = require("config");
	var util = require("util");

	// GridFS.
	// var Grid = require('gridfs-stream');
	// var gridfs;

	// Mongoose.
	var mongoose = require("mongoose");

	// Connect to database.
	var db = mongoose.createConnection();
	db.on('error', function(err)
		{
			if(err)
			
			db.db.close();

			connect();
		}
		);

	function connect () {
		db.open(config.mongolab.connectionString);
	}

	connect();

	// GridFS.
	/*
	db.once("open", function() {
		// TODO: db.db.
		_gridfs = Grid(db.db, mongoose.mongo);
	});
	*/

	// ---------- Users ----------
	var userSchema = mongoose.Schema({
		username: String,
		firstName: String,
		lastName: String,
		mobileNumber: Number,
		postcode: String,
		geo: {
			type: [ Number ],
			index: "2d"
		},
		emailAddress: String,
		categories: [ mongoose.Schema.Types.ObjectId ],
		created: Date,
		updated: Date
	});

	var _User = db.model("User", userSchema);

	var _getUser = function(id, next) {
		console.dir(id);
		
		var query = {
			_id: id
		};

		return _User.findOne(query, function(err, user) {
			console.dir(err);
			console.dir(user);

			next(err, user);
		});		
	};

	var _getUserByName = function(username, next) {
		assert.ok(username);
		assert.ok(next);

		console.dir(username);
		
		var query = {
			username: username
		};

		return _User.findOne(query, function(err, user) {
			console.dir(err);
			console.dir(user);

			next(err, user);
		});		
	};

	var _getUsersNear = function(latlng, radius, next) {
		var geo = [
			latlng.lat,
			latlng.lng
		];

		return _User.find({
			geo: {
				$nearSphere: geo,
				$maxDistance: radius
			}
		}, function(err, users) {
			next(err, users);
		});
	};

	var _updateUser = function(user, next) {
		user.save(function(err) {
			next(err);
		});
	};

	// ---------- Items ----------
	var itemSchema = mongoose.Schema({
		title: String,
		description: String,
		postcode: String,
		geo: {
			type: [ Number ],
			index: "2d"
		},
		radius: Number,
		category: String,
		tags: [ String ],
		userId: mongoose.Schema.Types.ObjectId,
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

		return _Item.find(query, function(err, items) {
			next(err, items);
		});
	};

	var _getItem = function(id, next) {
		console.dir(id);
		
		var query = {
			_id: id
		};

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

		// Users.
		User: _User,
		getUser: _getUser,
		getUserByName: _getUserByName,
		getUsersNear: _getUsersNear,
		updateUser: _updateUser,

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
