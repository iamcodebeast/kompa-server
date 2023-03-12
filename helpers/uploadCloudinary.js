const cloudinary = require("cloudinary").v2;
let config1 = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
};

module.exports = function uploadScreenshot(screenshot, text) {
    return new Promise((resolve, reject) => {
        let uploadOptions = {
            context: { title: text ? text : "title text" },
        };
        cloudinary.config(config1);
        uploadOptions.tags = ["regular"];
        cloudinary.uploader
            .upload_stream(uploadOptions, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            })
            .end(screenshot);
    });
};
