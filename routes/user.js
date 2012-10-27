exports.use = function(app) {
	var core = require("./core").use(app);

	app.post("/user.json", function(req, res) {
	});
};
