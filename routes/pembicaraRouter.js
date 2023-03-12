const express = require("express");
const Controller = require("../controllers/pembicara");
const { upload, uploadFiles } = require("../middlewares/multer");

const router = express.Router();

router.get("/", Controller.findAll);
router.post("/", upload.array("files"), uploadFiles, Controller.add);
router.put("/:id", upload.array("files"), uploadFiles, Controller.update);
router.delete("/:id", Controller.delete);

module.exports = router;
