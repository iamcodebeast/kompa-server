const KategoriLink = require("../models/kategoriLink");

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
            const kategoriLink = await KategoriLink.findAll(options);

            res.status(200).json(kategoriLink);
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
                        category: "kategoriLink",
                        imagekitId: el.id,
                    };
                    return obj;
                });
                data.foto = req.images[0].url;
            }

            const kategoriLink = await KategoriLink.insertOne(data);
            res.status(201).json({
                msg: "successfully create the kategoriLink",
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
                        category: "kategoriLink",
                        imagekitId: el.id,
                    };
                    return obj;
                });
                data.foto = req.images[0].url;
            }

            const kategoriLink = await KategoriLink.updateOne(id, data);
            if (!kategoriLink) {
                throw { name: `data not found` };
            }
            res.status(200).json(kategoriLink);
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;

            await KategoriLink.delete(id);
            res.status(200).json({
                message: `kategoriLink with Id ${id} success to delete`,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = Controller;
