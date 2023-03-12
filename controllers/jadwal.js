const Jadwal = require("../models/jadwal");
const { formatDate } = require("../helpers/day");
const { generateDocs } = require("../config/googledocs");

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
            const jadwal = await Jadwal.findAll(options);

            res.status(200).json(jadwal);
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
                        category: "jadwal",
                        imagekitId: el.id,
                    };
                    return obj;
                });
                data.foto = req.images[0].url;
            }

            const jadwal = await Jadwal.insertOne(data);
            res.status(201).json({
                msg: "successfully create the jadwal",
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
                        category: "jadwal",
                        imagekitId: el.id,
                    };
                    return obj;
                });
                data.foto = req.images[0].url;
            }

            const jadwal = await Jadwal.updateOne(id, data);
            if (!jadwal) {
                throw { name: `data not found` };
            }
            res.status(200).json(jadwal);
        } catch (error) {
            next(error);
        }
    }

    static async createDocument(req, res, next) {
        try {
            const { id } = req.params;

            const jadwal = await Jadwal.getOne(id);
            let dataTemplate = {
                "[tanggal]": formatDate(jadwal.tanggalMulai).formatedDate,
                "[pembicara]": jadwal.otherFields?.Pembicara?.detail?.nama,
                "[tempat]": jadwal.tempat,
                "[tema]": jadwal.tema,
                "[ayat alkitab]": jadwal.otherFields?.["Ayat Alkitab"],
                "[tujuan]": jadwal.otherFields?.Tujuan,
                "[bulan]": formatDate(jadwal.tanggalMulai).monthName,
            };
            const title = `Surat Pembicara - ${jadwal.namaKegiatan.trim()}`;

            const docs = await generateDocs(
                "1kwZCs9IbGZMENUE_1oVW6Qunzw4edy1b",
                "14S2BswNp0b5TlQeFBXl1aF7TsaZVGI7WMZsumVKpd1U",
                title,
                dataTemplate
            );

            const now = new Date();
            now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });

            const jadwalUpdated = await Jadwal.updateOne(id, {
                suratPembicara: {
                    title,
                    link: docs.link,
                    createdAt: now,
                },
            });

            res.status(200).json({
                msg: "success",
                jadwal,
                dataTemplate,
                docs,
                jadwalUpdated,
            });
        } catch (error) {
            next(error);
        }
    }

    static async createLiturgi(req, res, next) {
        try {
            const { id } = req.params;
            console.log(id);

            const jadwal = await Jadwal.getOne(id);
            // console.log(jadwal);
            let dataTemplate = {
                "[namaKegiatan]": jadwal.namaKegiatan.toUpperCase(),
                "[tanggal]": formatDate(jadwal.tanggalMulai).formatedDate,
                "[tema]": jadwal.tema,
                "[ayatAlkitab]": jadwal.otherFields?.["Ayat Alkitab"],
                "[bulan]": formatDate(jadwal.tanggalMulai).monthName,
            };

            if (jadwal.listLagu) {
                jadwal.listLagu.forEach((el) => {
                    dataTemplate[`[judul ${el.title}]`] = el.judul;
                    dataTemplate[`[lirik ${el.title}]`] = el.lirik;
                });
            }

            const title = `Liturgi - ${jadwal.namaKegiatan.trim()}`;

            const docs = await generateDocs(
                "1GZEysxaCLjSrxMh6KvbzHRgFXkYNS8ae",
                "1Xs5LkHbQhmY_tUlDLJNPo3wwUJynXv1HRlmp0aQuuF8",
                title,
                dataTemplate
            );

            const now = new Date();
            now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });

            const jadwalUpdated = await Jadwal.updateOne(id, {
                liturgi: {
                    title,
                    link: docs.link,
                    createdAt: now,
                },
            });

            res.status(200).json({
                msg: "success",
                jadwal,
                dataTemplate,
                docs,
                jadwalUpdated,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateLagu(req, res, next) {
        try {
            const { id } = req.params;
            const { listLagu } = req.body;
            const jadwalUpdated = await Jadwal.updateOne(id, {
                listLagu: listLagu,
            });
            res.status(200).json(jadwalUpdated);
        } catch (error) {
            next(error);
        }
    }

    static async deleteDocument(req, res, next) {
        try {
            const { id } = req.params;
            const { documentName } = req.body;
            const jadwalUpdated = await Jadwal.updateOne(id, {
                [documentName]: null,
            });
            res.status(200).json(jadwalUpdated);
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            await Jadwal.delete(id);
            res.status(200).json({
                message: `jadwal with Id ${id} success to delete`,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = Controller;
