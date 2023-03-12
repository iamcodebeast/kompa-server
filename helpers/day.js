const dayjs = require("dayjs");
require("dayjs/locale/id");
const relativeTime = require("dayjs/plugin/relativeTime");

dayjs.locale("id");
dayjs.extend(relativeTime);

const formatDate = (date) => {
    let day = dayjs(date);
    return {
        formatedDate: day.format("dddd, DD MMMM YYYY"),
        monthName: day.format("MMMM"),
    };
};
module.exports = { formatDate };
