const express = require("express");
const Controller = require("../controllers/search-image");

const router = express.Router();

router.get("/", Controller.searchImage);

module.exports = router;
