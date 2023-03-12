const BidangPelayanan = require("../models/bidangPelayanan");

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
            const bidangPelayanan = await BidangPelayanan.findAll(options);

            res.status(200).json(bidangPelayanan);
        } catch (error) {
            next(error);
        }
    }

    static async add(req, res, next) {
        try {
            let data = req.body;

            if (req.images) {
                data.images = req.images.map((el) => {
                    let obj = {
                        url: el.url,
                        category: "bidangPelayanan",
                        imagekitId: el.id,
                    };
                    return obj;
                });
                data.foto = req.images[0].url;
            }

            const bidangPelayanan = await BidangPelayanan.insertOne(data);
            res.status(201).json({
                msg: "successfully create the bidangPelayanan",
            });
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const { id } = req.params;
            let data = req.body;

            if (data._id) {
                delete data._id;
            }

            if (req.images) {
                data.images = req.images.map((el) => {
                    let obj = {
                        url: el.url,
                        category: "bidangPelayanan",
                        imagekitId: el.id,
                    };
                    return obj;
                });
                data.foto = req.images[0].url;
            }

            const bidangPelayanan = await BidangPelayanan.updateOne(id, data);
            if (!bidangPelayanan) {
                throw { name: `data not found` };
            }
            res.status(200).json(bidangPelayanan);
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const location = await BidangPelayanan.findOne(id);
            if (!location) {
                throw { name: `data not found` };
            }
            await BidangPelayanan.delete(id);
            res.status(200).json({
                message: `bidangPelayanan with Id ${id} success to delete`,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = Controller;
