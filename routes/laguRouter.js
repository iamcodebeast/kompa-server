const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res, next) => {
    try {
        const { nama } = req.query;
        let result = [];
        if (nama) {
            const { data } = await axios({
                method: "get",
                url:
                    "https://www.psalmnote.com/api/song/:search?searchString=" +
                    nama,
            });

            for (key in data) {
                result.push(...data[key]);
            }
        }
        result = result.map((el) => {
            let obj = {
                nama: `${el.title} - ${el.artist}`,
                title: el.title,
                artist: el.artist,
                alias: el.alias,
            };
            return obj;
        });

        res.status(200).json({
            msg: "success",
            nama,
            data: result ? result : null,
        });
    } catch (error) {
        next(error);
    }
});

router.get("/:alias", async (req, res, next) => {
    try {
        const { alias } = req.params;
        let obj = {};
        let lyric = "";
        if (alias) {
            const { data } = await axios({
                method: "get",
                url: `https://www.psalmnote.com/api/song/${alias}`,
            });

            obj = data;

            if (data.song) {
                data.song.forEach((el) => {
                    if (el.part === "Chorus" && el.content.length) {
                        lyric += "Reff.\n";
                    }
                    if (el.part !== "Intro" && el.content.length) {
                        el.content.forEach((ct) => {
                            if (ct.row === "lyric") {
                                lyric +=
                                    ct.lyric.replace(/\s+/g, " ").trim() + "\n";
                            }
                        });
                        lyric += "\n";
                    }
                });
            }

            obj.fullLyric = lyric;
        }

        res.status(200).json({
            msg: "success",
            result: {
                id: obj.id,
                title: obj.title,
                chordBase: obj.chordBase,
                artist: obj.artist,
                languageCode: obj.languageCode,
                alias: obj.alias,
                fullLyric: obj.fullLyric,
            },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
