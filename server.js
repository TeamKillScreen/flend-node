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

// Routes.
require("./routes/users").use(app);
require("./routes/items").use(app);
require("./routes/categories").use(app);

// Geo.
/*
var geo = require("./geo/geo");

geo.getPostcodeLatLng("OL15 8JF", function(error, latlng) {
	if (error) {
		console.dir(error);
	} else {
		console.dir(latlng);
	}
});
*/

// Run app.
var port = process.env.PORT || 3000;

app.listen(port, function() {
        console.log(util.format("Listening on %d.", port));
});
