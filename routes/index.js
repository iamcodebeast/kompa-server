const express = require("express");
const router = express.Router();
const pemudaRouter = require("./pemudaRouter");
const pembicaraRouter = require("./pembicaraRouter");
const pelayanRouter = require("./pelayanRouter");
const bidangPelayananRouter = require("./bidangPelayananRouter");
const linkRouter = require("./linkRouter");
const kategoriLinkRouter = require("./kategoriLinkRouter");
const kategoriTemplate = require("./kategoriTemplateRouter");
const templateRouter = require("./templateRouter");
const groupRouter = require("./groupRouter");
const kategoriJadwalRouter = require("./kategoriJadwalRouter");
const jadwalRouter = require("./jadwalRouter");
const reminderRouter = require("./reminderRouter");
const searchImageRouter = require("./searchImageRouter");
const takeScreenshot = require("../helpers/screenshot");
const uploadScreenshot = require("../helpers/uploadCloudinary");
const whatsappRouter = require("./whatsappRouter");
const laguRouter = require("./laguRouter");
const dashboardRouter = require("./dashboardRouter");

router.get("/", (req, res) => {
    res.status(200).json({
        msg: "server alive",
    });
});
router.use("/pemuda", pemudaRouter);
router.use("/pembicara", pembicaraRouter);
router.use("/pelayan", pelayanRouter);
router.use("/bidang-pelayanan", bidangPelayananRouter);
router.use("/link", linkRouter);
router.use("/kategori-link", kategoriLinkRouter);
router.use("/kategori-template", kategoriTemplate);
router.use("/template", templateRouter);
router.use("/group", groupRouter);
router.use("/kategori-jadwal", kategoriJadwalRouter);
router.use("/jadwal", jadwalRouter);
router.use("/reminder", reminderRouter);
router.use("/whatsapp", whatsappRouter);
router.use("/lagu", laguRouter);

router.use("/dashboard", dashboardRouter);

router.get("/screenshot", (req, res) => {
    let objText = {};
    let url =
        "https://www.canva.com/design/DAFXpl-qQVY/aWRuMs8gZ6ov-1qNJ1XWtg/view?utm_content=DAFXpl-qQVY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink#2";
    let content = {
        date: "28 October",
        name: "Philicia Octa",
        photo: "https://ik.imagekit.io/kompagkj/foto/image-924_fTLxEoPDq",
        quotes: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    };
    takeScreenshot(url, content)
        .then((data) => {
            let text = "TEST";
            return uploadScreenshot(data.screenshot, text);
        })
        .then((result) => {
            result.text = objText;
            res.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        });
});
// router.use("/search-image", searchImageRouter);

module.exports = router;
