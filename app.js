if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const router = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const { mongoConnect } = require("./config/mongo.js");
const cors = require("cors");
const { client } = require("./config/bull");

app.use(cors());

app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(router);

app.use(errorHandler);

mongoConnect()
    .then(() => {
        console.log("connected to db");
        return client.connect();
    })
    .then((_) => {
        console.log("redis connected");
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });
    });
