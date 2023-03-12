const express = require("express");
const Controller = require("../controllers/whatsapp");

const router = express.Router();

router.get("/connect", Controller.connect);
router.get("/check-connection", Controller.checkConnection);
router.get("/logout", Controller.logout);
router.post("/send-message/:id", Controller.sendMessage);
router.post("/broadcasted-by/:id", Controller.saveConnection);

module.exports = router;
