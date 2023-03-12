const Pelayan = require("../models/pelayan");

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
            const pelayan = await Pelayan.findAll(options);

            res.status(200).json(pelayan);
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
                        category: "pelayan",
                        imagekitId: el.id,
                    };
                    return obj;
                });
                data.foto = req.images[0].url;
            }

            const pelayan = await Pelayan.insertOne(data);
            res.status(201).json({ msg: "successfully create the Pelayan" });
        } catch (error) {
            next(error);
        }
    }

    static async insertMany(req, res, next) {
        try {
            let data = req.body;

            const pelayan = await Pelayan.insertMany(data);
            res.status(201).json({ msg: "successfully create the Pelayan" });
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

            const pelayan = await Pelayan.updateOne(id, data);
            if (!pelayan) {
                throw { name: `data not found` };
            }
            res.status(200).json(pelayan);
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;

            await Pelayan.delete(id);
            res.status(200).json({
                message: `Pelayan with Id ${id} success to delete`,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = Controller;
