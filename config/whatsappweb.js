const qrcode = require("qrcode");
const { Client } = require("whatsapp-web.js");
const { phoneNumberFormatter } = require("../helpers/formatter");
const { updateSentStatus } = require("../models/reminder");

let attemptQr = 0;

const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process", // <- this one doesn't works on Windows
            "--disable-gpu",
        ],
    },
});
let alreadyInit = false;

const generateOneMessage = (text, user, event) => {
    let result = "";
    let data = {
        ...user,
        ...event,
    };

    let word = "";
    let found = false;
    for (let i in text) {
        let char = text[i];
        if (char === "[") {
            found = true;
            continue;
        }
        if (char === "]") {
            found = false;
            result += data[word];
            word = "";
            continue;
        }

        if (found) {
            word += char;
        } else {
            result += char;
        }
    }
    return result;
};

client.on("ready", async () => {
    try {
        console.log("Client is ready!");
    } catch (error) {
        console.log("masuk sini");
        console.log(error);
    }
});

const getClient = () => {
    if (!alreadyInit) {
        return null;
    }

    return client;
};

const sendMessage = async function (payload) {
    try {
        console.log("sending message to " + payload.user.nama);
        let number = payload.user.wa;
        const chatId = phoneNumberFormatter(number);

        const result = await getClient().isRegisteredUser(chatId);
        if (!result) throw { msg: "upps not a wa number" };

        let message = payload.message;
        let event = payload.event;
        let user = payload.user;

        message = generateOneMessage(message, user, event);

        const regex = /\\n/gi;
        message = message.replace(regex, "\n");

        let response = await getClient().sendMessage(chatId, message);

        console.log("message sent!");
        await updateSentStatus(payload._id, user._id);
        return "success";
    } catch (error) {
        throw error;
    }
};

const initCLient = async () => {
    try {
        return new Promise((resolve, reject) => {
            try {
                client.initialize();
                alreadyInit = true;
            } catch (error) {
                throw error;
            }
            return client.on("qr", async (qr) => {
                try {
                    attemptQr += 1;
                    console.log("attempt qr: ", attemptQr);
                    if (attemptQr === 3) {
                        attemptQr = 0;
                    }
                    resolve({
                        qr,
                        url: `https://chart.apis.google.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(
                            qr
                        )}`,
                    });
                } catch (error) {
                    reject(error);
                    throw error;
                }
            });
        });
    } catch (error) {
        throw error;
    }
};

module.exports = { getClient, initCLient, sendMessage };
