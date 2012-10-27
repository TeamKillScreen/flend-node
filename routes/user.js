exports.use = function(app) {
	var core = require("./core").use(app);

	app.post("/signin", function(req, res) {
	});
};
