const { ObjectId } = require("mongodb");
const { getDb, client } = require("../config/mongo");

class Pembicara {
    static getCollection() {
        const collection = getDb().collection("pembicara");
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
            let pembicara = await collection
                .find(query)
                .sort({ _id: -1 })
                .skip(+pageNumber > 0 ? (+pageNumber - 1) * +perPage : 0)
                .limit(+perPage)
                .toArray();

            pembicara = pembicara.map((el) => {
                if (el.foto.includes("google")) {
                    const id = el.foto.split("id=")[1];
                    const displayUrl =
                        `https://drive.google.com/uc?export=view&id=` + id;
                    el.foto = displayUrl;
                }
                return el;
            });
            const totalData = await collection.find(query).count();

            return {
                data: pembicara,
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
            const pembicara = await collection.insertOne(payload, { session });

            await session.commitTransaction();
            return pembicara;
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
            const pembicara = await collection.updateOne(
                {
                    _id: ObjectId(id),
                },
                {
                    $set: payload,
                }
            );
            return pembicara;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const collection = this.getCollection();
            const pembicara = await collection.deleteOne({ _id: ObjectId(id) });
            return pembicara;
        } catch (error) {
            throw error;
        }
    }

    static async bulkInsert(data) {
        try {
            const collection = this.getCollection();
            const pembicara = await collection.insertMany(data);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Pembicara;
