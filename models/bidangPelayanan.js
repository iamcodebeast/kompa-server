const { ObjectId } = require("mongodb");
const { getDb, client } = require("../config/mongo");

class BidangPelayanan {
    static getCollection() {
        const collection = getDb().collection("bidangPelayanan");
        return collection;
    }
    static async findAll(options) {
        try {
            const collection = this.getCollection();
            let pageNumber = options.page || 1;
            let perPage = options.perPage || 10;
            let bidangPelayanan = await collection
                .find()
                .sort({ _id: -1 })
                .skip(+pageNumber > 0 ? (+pageNumber - 1) * +perPage : 0)
                .limit(+perPage)
                .toArray();

            const pelayanCollection = getDb().collection("pelayan");
            const pelayan = await pelayanCollection
                .aggregate([
                    {
                        $group: {
                            _id: "$bidangPelayananId",
                            count: { $count: {} },
                        },
                    },
                ])
                .toArray();

            bidangPelayanan = bidangPelayanan.map((el) => {
                if (el.foto?.includes("google")) {
                    const id = el.foto.split("id=")[1];
                    const displayUrl =
                        `https://drive.google.com/uc?export=view&id=` + id;
                    el.foto = displayUrl;
                }
                let dataPelayan = pelayan.filter(
                    (dt) => dt._id === el._id.toString()
                );
                if (dataPelayan[0]) {
                    el.count = dataPelayan[0].count;
                } else {
                    el.count = 0;
                }

                return el;
            });
            const totalData = await collection.count();

            return {
                data: bidangPelayanan,
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
            const bidangPelayanan = await collection.insertOne(payload, {
                session,
            });

            await session.commitTransaction();
            return bidangPelayanan;
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
            const bidangPelayanan = await collection.updateOne(
                {
                    _id: ObjectId(id),
                },
                {
                    $set: payload,
                }
            );
            return bidangPelayanan;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const collection = this.getCollection();
            const bidangPelayanan = await collection.deleteOne({
                _id: ObjectId(id),
            });
            return bidangPelayanan;
        } catch (error) {
            throw error;
        }
    }

    static async bulkInsert(data) {
        try {
            const collection = this.getCollection();
            const bidangPelayanan = await collection.insertMany(data);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = BidangPelayanan;
