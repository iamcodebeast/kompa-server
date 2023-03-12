const multer = require("multer");
const Jimp = require("jimp");
const upload = multer({
    limits: { fieldSize: 10 * 1024 * 1024 },
});

var ImageKit = require("imagekit");
var imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_APIKEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_APIKEY,
    urlEndpoint: "https://ik.imagekit.io/tpoqbckhpty",
});

const uploadFiles = async (req, res, next) => {
    try {
        if (req.body.foto && req.body.foto.includes("base64")) {
            const bodyFilesFiltered = [req.body.foto]
                .filter((el) => el)
                .filter((el, idx, arr) => arr.indexOf(el) === idx);

            const bodyFiles = bodyFilesFiltered.map((el) => {
                let obj = {
                    buffer: el,
                    originalname:
                        req.body.username ||
                        "image-" + Math.floor(Math.random() * 1000),
                };
                return obj;
            });
            req.files = [...bodyFiles];
        }

        if (!req.files) {
            next();
            return;
        }

        let bufferArr = await Promise.all(
            req.files.map(async (el) => {
                let buffer = el.buffer;
                if (el.fieldname !== "files") {
                    buffer = Buffer.from(
                        el.buffer.split("base64,")[1],
                        "base64"
                    );
                }
                let image = await Jimp.read(buffer);
                if (image.getWidth() > 2000) {
                    const isHorizontal = image.getWidth() > image.getHeight();
                    const ratio = isHorizontal
                        ? image.getWidth() / image.getHeight()
                        : image.getHeight() / image.getWidth();
                    const width = 2000; // set the width you want
                    const height = isHorizontal ? width / ratio : width * ratio;
                    image.resize(width, height);
                }
                let compressedImage = await image
                    .quality(50)
                    .getBufferAsync(Jimp.MIME_JPEG);

                if (image.getWidth() > 2000) {
                    let newImg = await Jimp.read(compressedImage);
                    const isHorizontal = newImg.getWidth() > newImg.getHeight();
                    const ratio = isHorizontal
                        ? newImg.getWidth() / newImg.getHeight()
                        : newImg.getHeight() / newImg.getWidth();
                    const width = 2000; // set the width you want
                    const height = isHorizontal ? width / ratio : width * ratio;
                    let compressedImage = newImg.resize(width, height);
                }
                el.buffer = compressedImage;
                return el;
            })
        );

        req.files = bufferArr;

        if (req.files.length) {
            if (req.body.imagekitId) {
                await imagekit.deleteFile(req.body.imagekitId);
            }

            const imagekitRes = await Promise.all(
                req.files.map(async (el) => {
                    return imagekit.upload({
                        file: el.buffer,
                        fileName: el.originalname,
                        folder: req.body.folderName || "foto",
                    });
                })
            );

            req.images = imagekitRes.map((el) => {
                return {
                    url: el.url,
                    id: el.fileId,
                };
            });

            next();
        } else {
            next();
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { upload, uploadFiles };
