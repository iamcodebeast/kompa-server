const { ObjectId } = require("mongodb");
const { getDb, client } = require("../config/mongo");

class Dashboard {
    static getCollection() {
        const collection = getDb().collection("link");
        return collection;
    }
    static pemudaCollection() {
        const collection = getDb().collection("pemuda");
        return collection;
    }
    static pembicaraCollection() {
        const collection = getDb().collection("pembicara");
        return collection;
    }
    static async findAll(options) {
        try {
            let pemuda = this.pemudaCollection()
                .aggregate([
                    {
                        $facet: {
                            info: [
                                {
                                    $group: {
                                        _id: null,
                                        count: { $sum: 1 },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            title: "Jemaat",
                            unit: "orang",
                            icon: `<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />`,
                        },
                    },
                ])
                .toArray();

            let pembicara = this.pembicaraCollection()
                .aggregate([
                    {
                        $facet: {
                            info: [
                                {
                                    $group: {
                                        _id: null,
                                        count: { $sum: 1 },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            title: "Pembicara",
                            unit: "orang",
                            icon: `<path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"
                        />`,
                        },
                    },
                ])
                .toArray();

            let raw = await Promise.all([pemuda, pembicara]);
            let result = raw.map((el) => {
                let obj = {
                    count: el[0].info[0].count,
                    title: el[0].title,
                    unit: el[0].unit,
                    icon: el[0].icon,
                };
                return obj;
            });

            return {
                msg: "OK",
                result,
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Dashboard;
