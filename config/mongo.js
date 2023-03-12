const { MongoClient } = require("mongodb");

const uri = process.env.URI_SECRET;

const client = new MongoClient(uri);
let db = null;
async function mongoConnect() {
    try {
        db = client.db("pemuda");
        return db;
    } catch (error) {
        console.log(error);
    }
}

function getDb() {
    return db;
}

module.exports = { mongoConnect, getDb, client };
