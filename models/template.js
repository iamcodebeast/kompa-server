const { ObjectId } = require("mongodb");
const { getDb, client } = require("../config/mongo");

class Template {
    static getCollection() {
        const collection = getDb().collection("template");
        return collection;
    }
    static async findAll(options) {
        try {
            const collection = this.getCollection();
            let pageNumber = options.page || 1;
            let perPage = options.perPage || 10;
            delete options.page;
            delete options.perPage;

            let query = {};
            Object.keys(options).map((el) => {
                query[el] = {
                    $regex: new RegExp(options[el], "i"),
                };
            });
            console.log(query);

            let template = await collection
                .aggregate([
                    {
                        $addFields: {
                            kategoriObjId: {
                                $toObjectId: "$kategori",
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "kategoriTemplate",
                            localField: "kategoriObjId",
                            foreignField: "_id",
                            as: "kategoriDetail",
                        },
                    },
                    {
                        $addFields: {
                            kategori: "$kategoriDetail.namaKategori",
                        },
                    },
                    {
                        $match: { ...query },
                    },
                    {
                        $facet: {
                            edges: [
                                {
                                    $sort: { _id: -1 },
                                },
                                {
                                    $skip:
                                        +pageNumber > 0
                                            ? (+pageNumber - 1) * +perPage
                                            : 0,
                                },
                                {
                                    $limit: +perPage,
                                },
                            ],
                            pageInfo: [
                                { $group: { _id: null, count: { $sum: 1 } } },
                            ],
                        },
                    },
                ])
                .toArray();
            const totalData = template[0]?.pageInfo[0]?.count;

            template[0].edges = template[0].edges.map((el) => {
                if (el.pemuda) {
                    let foto = el.pemuda?.foto;
                    if (foto?.includes("google")) {
                        const id = foto.split("id=")[1];
                        const displayUrl =
                            `https://drive.google.com/uc?export=view&id=` + id;
                        el.pemuda.foto = displayUrl;
                    }
                }
                return el;
            });

            return {
                data: template[0].edges,
                pageNumber: +pageNumber,
                perPage: +perPage,
                totalData,
                totalPage: Math.ceil(totalData / perPage),
            };
        } catch (error) {
            throw error;
        }
    }

    static async insertOne(payload) {
        const transactionOptions = {
            readConcern: { level: "snapshot" },
            writeConcern: { w: "majority" },
            readPreference: "primary",
        };
        const session = client.startSession();

        try {
            session.startTransaction(transactionOptions);
            const collection = this.getCollection();
            const template = await collection.insertOne(payload, {
                session,
            });

            await session.commitTransaction();
            return template;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
    static async updateOne(id, payload) {
        try {
            const collection = this.getCollection();
            const template = await collection.updateOne(
                {
                    _id: ObjectId(id),
                },
                {
                    $set: payload,
                }
            );
            return template;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const collection = this.getCollection();
            const template = await collection.deleteOne({
                _id: ObjectId(id),
            });
            return template;
        } catch (error) {
            throw error;
        }
    }

    static async bulkInsert(data) {
        try {
            const collection = this.getCollection();
            const template = await collection.insertMany(data);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Template;
