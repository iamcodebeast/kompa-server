const { ObjectId } = require("mongodb");
const { getDb, client } = require("../config/mongo");

class Pemuda {
    static getCollection() {
        const collection = getDb().collection("pemuda");
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

            let pemuda = await collection
                .aggregate([
                    {
                        $addFields: {
                            month: {
                                // $substr: ["$tanggalLahir", 5, 2],
                                $cond: {
                                    if: {
                                        $regexMatch: {
                                            input: "$tanggalLahir",
                                            regex: /-/,
                                        },
                                    },
                                    then: { $substr: ["$tanggalLahir", 5, 2] },
                                    else: { $substr: ["$tanggalLahir", 3, 2] },
                                },
                            },
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
                                {
                                    $group: { _id: null, count: { $sum: 1 } },
                                },
                            ],
                        },
                    },
                ])
                .toArray();
            // const totalData = await collection.find(query).count();
            const totalData = pemuda[0]?.pageInfo[0]?.count;

            pemuda[0].edges = pemuda[0].edges.map((el) => {
                let foto = el.foto;
                if (foto?.includes("google")) {
                    const id = foto.split("id=")[1];
                    const displayUrl =
                        `https://drive.google.com/uc?export=view&id=` + id;
                    el.foto = displayUrl;
                }
                return el;
            });
            // console.log(JSON.stringify(pemuda, null, 2));

            return {
                data: pemuda[0].edges,
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
            const pemuda = await collection.insertOne(payload, { session });

            await session.commitTransaction();
            return pemuda;
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
            const pemuda = await collection.updateOne(
                {
                    _id: ObjectId(id),
                },
                {
                    $set: payload,
                }
            );
            return pemuda;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const collection = this.getCollection();
            const pemuda = await collection.deleteOne({ _id: ObjectId(id) });
            return pemuda;
        } catch (error) {
            throw error;
        }
    }

    static async bulkInsert(data) {
        try {
            const collection = this.getCollection();
            const pemuda = await collection.insertMany(data);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Pemuda;
