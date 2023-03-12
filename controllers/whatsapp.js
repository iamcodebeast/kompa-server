const { getClient, initCLient, sendMessage } = require("../config/whatsappweb");
const { addToScheduler } = require("../config/bull");
const Reminder = require("../models/reminder");

class Controller {
    static async connect(req, res, next) {
        try {
            const urlQr = await initCLient();
            res.status(200).json({ msg: "check console to login", urlQr });
        } catch (error) {
            next(error);
        }
    }
    static async checkConnection(req, res, next) {
        try {
            if (!getClient()) throw { msg: "please scan wa first" };

            const data = await getClient().getState();
            if (data !== "CONNECTED") throw { msg: "please login wa first" };
            const info = getClient().info;

            res.status(200).json({
                msg: "connected",
                pushname: info.pushname,
                waNumber: info.wid.user,
            });
        } catch (error) {
            next(error);
        }
    }
    static async saveConnection(req, res, next) {
        try {
            const { id } = req.params;
            const { pushname, waNumber, connectedAt } = req.body;

            const link = await Reminder.updateOne(id, {
                broadcastedBy: { pushname, waNumber, connectedAt },
            });
            if (!link) {
                throw { name: `data not found` };
            }

            res.status(200).json({
                msg: "succesfully saved",
            });
        } catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            if (!getClient()) throw { msg: "please scan wa first" };
            const data = await getClient().getState();

            if (data === "CONNECTED") {
                await getClient().logout();
            }
            setTimeout(() => {
                getClient().destroy();
            }, 2000);
            res.status(200).json({ msg: "success logout the device" });
        } catch (error) {
            next(error);
        }
    }
    static async sendMessage(req, res, next) {
        try {
            const { id } = req.params;
            const { broadcastedAt } = req.body;
            const result = await Reminder.getOne(id);

            if (!result) throw { msg: "data not found" };

            const users = result.group.detail.pemudaDetail;
            const payload = users.map((el) => {
                let obj = {
                    _id: result._id,
                    message: result.template,
                    event: result.kegiatan.detail,
                    user: el,
                };
                return obj;
            });

            if (!getClient()) throw { msg: "please scan wa first" };

            const data = await getClient().getState();
            if (data !== "CONNECTED") throw { msg: "please login wa first" };

            let timeToWait = await addToScheduler(payload, sendMessage);
            await Reminder.updateOne(id, {
                broadcastedAt,
                status: "sending",
                timeToWait: timeToWait,
            });

            res.status(200).json({
                msg: "success add to schedule",
                timeToWait,
                broadcastedAt,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = Controller;
