// Utility packages.
var _ = require("underscore");
var util = require("util");

// Express.
var express = require("express");

// App.
var app = express();

// App middleware.
app.use(express.bodyParser());
app.use(app.router);

// Database.
app.repository = require("./db/repository").connect();

/*
app.repository.addItem(item, function(err) {
	if (err) {
		console.error("addItem: Failed:");
		console.dir(err);
	}
});

app.repository.getItems(function(err, people) {
	if (err) {
		console.error("getItems: Failed:");
		console.dir(err);
	} else {
		_.each(people, function(person) {
			console.dir(person);
		});
	}
});
*/

// Routes.
require("./routes/users").use(app);
require("./routes/items").use(app);
require("./routes/categories").use(app);

// Run app.
var port = process.env.PORT || 3000;

app.listen(port, function() {
        console.log(util.format("Listening on %d.", port));
});
