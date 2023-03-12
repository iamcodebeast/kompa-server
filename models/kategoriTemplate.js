const { ObjectId } = require("mongodb");
const { getDb, client } = require("../config/mongo");

class KategoriLink {
    static getCollection() {
        const collection = getDb().collection("kategoriTemplate");
        return collection;
    }
    static async findAll(options) {
        try {
            const collection = this.getCollection();
            let pageNumber = options.page || 1;
            let perPage = options.perPage || 10;
            let kategoriLink = await collection
                .find()
                .sort({ _id: -1 })
                .skip(+pageNumber > 0 ? (+pageNumber - 1) * +perPage : 0)
                .limit(+perPage)
                .toArray();

            const linkCollection = getDb().collection("template");
            const link = await linkCollection
                .aggregate([
                    {
                        $group: {
                            _id: "$kategori",
                            count: { $count: {} },
                        },
                    },
                ])
                .toArray();

            kategoriLink = kategoriLink.map((el) => {
                let dataLink = link.filter(
                    (dt) => dt._id === el._id.toString()
                );
                if (dataLink[0]) {
                    el.count = dataLink[0].count;
                } else {
                    el.count = 0;
                }

                return el;
            });
            const totalData = await collection.count();

            return {
                data: kategoriLink,
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
            const kategoriLink = await collection.insertOne(payload, {
                session,
            });

            await session.commitTransaction();
            return kategoriLink;
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
            const kategoriLink = await collection.updateOne(
                {
                    _id: ObjectId(id),
                },
                {
                    $set: payload,
                }
            );
            return kategoriLink;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const collection = this.getCollection();
            const kategoriLink = await collection.deleteOne({
                _id: ObjectId(id),
            });
            return kategoriLink;
        } catch (error) {
            throw error;
        }
    }

    static async bulkInsert(data) {
        try {
            const collection = this.getCollection();
            const kategoriLink = await collection.insertMany(data);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = KategoriLink;
