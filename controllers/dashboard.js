const Dashboard = require("../models/dashboard");

class Controller {
    static async findAll(req, res, next) {
        try {
            let options = {};
            if (req.user) {
                options.userId = req.user.id;
            }
            if (req.query) {
                options = { ...options, ...req.query };
            }
            const dashboard = await Dashboard.findAll(options);

            res.status(200).json(dashboard);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = Controller;
