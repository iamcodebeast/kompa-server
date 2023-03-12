const { ObjectId } = require("mongodb");
const { getDb, client } = require("../config/mongo");

class Pelayan {
    static getCollection() {
        const collection = getDb().collection("pelayan");
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

            let pelayan = await collection
                .aggregate([
                    {
                        $group: {
                            _id: "$pemudaId",
                            bidangPelayananId: { $push: "$bidangPelayananId" },
                        },
                    },
                    {
                        $lookup: {
                            let: {
                                pemudaObjId: {
                                    $toObjectId: "$_id",
                                },
                            },
                            from: "pemuda",
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$_id", "$$pemudaObjId"],
                                        },
                                    },
                                },
                            ],
                            as: "pemuda",
                        },
                    },
                    {
                        $addFields: {
                            bidangPelayananObjectId: {
                                $map: {
                                    input: "$bidangPelayananId",
                                    in: {
                                        $convert: {
                                            input: "$$this",
                                            to: "objectId",
                                            onError: "",
                                            onNull: "",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "bidangPelayanan",
                            localField: "bidangPelayananObjectId",
                            foreignField: "_id",
                            as: "bidang",
                        },
                    },
                    {
                        $match: query.nama
                            ? {
                                  "pemuda.nama": query.nama,
                              }
                            : {},
                    },
                    {
                        $match: query.bidangPelayanan
                            ? {
                                  "bidang.nama": query.bidangPelayanan,
                              }
                            : {},
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
                                {
                                    $unwind: {
                                        path: "$pemuda",
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                                {
                                    $addFields: {
                                        test: "$pemuda.name",
                                        pemudaName: "$pemuda.name",
                                    },
                                },
                            ],
                            pageInfo: [
                                { $group: { _id: null, count: { $sum: 1 } } },
                            ],
                        },
                    },
                ])
                .toArray();
            const totalData = pelayan[0]?.pageInfo[0]?.count;

            pelayan[0].edges = pelayan[0].edges.map((el) => {
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
                data: pelayan[0].edges,
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
            const pelayan = await collection.insertOne(payload, { session });

            await session.commitTransaction();
            return pelayan;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    static async insertMany(payload) {
        const transactionOptions = {
            readConcern: { level: "snapshot" },
            writeConcern: { w: "majority" },
            readPreference: "primary",
        };
        const session = client.startSession();

        try {
            session.startTransaction(transactionOptions);
            const collection = this.getCollection();

            let result = [];
            payload.bidangPelayananId.forEach((el) => {
                let bidangPelayananId = el;
                let pemudaId = null;
                payload.pemudaId.forEach((data) => {
                    pemudaId = data;
                    result.push({
                        bidangPelayananId,
                        pemudaId,
                    });
                });
            });

            const pelayan = await collection.insertMany(result, { session });

            await session.commitTransaction();
            return pelayan;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    static async updateOne(id, payload) {
        const transactionOptions = {
            readConcern: { level: "snapshot" },
            writeConcern: { w: "majority" },
            readPreference: "primary",
        };
        const session = client.startSession();

        try {
            session.startTransaction(transactionOptions);
            const collection = this.getCollection();
            const query = {
                pemudaId: id,
            };
            await collection.deleteMany(query, { session });
            let result = [];
            payload.bidangPelayanan.forEach((el) => {
                let bidangPelayananId = el;
                result.push({
                    bidangPelayananId,
                    pemudaId: id,
                });
            });
            const pelayan = await collection.insertMany(result, { session });

            await session.commitTransaction();
            return pelayan;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    static async delete(id) {
        try {
            const collection = this.getCollection();
            const query = {
                pemudaId: id,
            };
            const pelayan = await collection.deleteMany(query);
            return pelayan;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Pelayan;
