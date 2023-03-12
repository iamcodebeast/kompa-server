const { image_search } = require("duckduckgo-images-api");

class Controller {
    static async searchImage(req, res, next) {
        try {
            const query = req.query.q;
            const result = await image_search({
                query: query || "birds",
                moderate: true,
            });

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = Controller;
