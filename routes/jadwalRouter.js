const express = require("express");
const Controller = require("../controllers/jadwal");
const { upload, uploadFiles } = require("../middlewares/multer");

const router = express.Router();

router.get("/", Controller.findAll);
router.post("/", upload.array("files"), uploadFiles, Controller.add);
router.put("/:id", upload.array("files"), uploadFiles, Controller.update);
router.patch("/:id/create-document", Controller.createDocument);
router.patch("/:id/delete-document", Controller.deleteDocument);
router.patch("/:id/create-liturgi", Controller.createLiturgi);
router.patch("/:id/update-lagu", Controller.updateLagu);
router.delete("/:id", Controller.delete);

module.exports = router;
