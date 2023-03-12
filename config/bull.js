const Queue = require("bull");
const milliseconds = require("milliseconds");
const Redis = require("redis");
const client = Redis.createClient();
const scheduler = new Queue("schedulerQueue");
let actionTodo = null;

const addToScheduler = async (data, action) => {
    try {
        actionTodo = action;
        const promises = data.map((el, idx) => {
            el.idx = idx;
            el.totalData = data.length;
            let seconds = (idx + 1) * (5 + Math.ceil(Math.random() * 10));
            scheduler.add(el, {
                delay: milliseconds.seconds(
                    (idx + 1) * (5 + Math.ceil(Math.random() * 10))
                ),
            });
            return seconds;
        });

        return await Promise.all(promises);
    } catch (error) {
        console.log(error);
    }
};

scheduler.process(async (job, done) => {
    try {
        if (actionTodo) {
            await actionTodo(job.data);
        }
        done();
    } catch (error) {
        console.log(error);
        done(error);
    }
});

scheduler.on("completed", async (job) => {
    console.log("complete!", job.data.idx);
    if (job.data.idx === job.data.totalData - 1) {
        console.log("all done");
        await client.flushAll();
        console.log("success flush all cache");
    }
});

module.exports = { addToScheduler, client };
