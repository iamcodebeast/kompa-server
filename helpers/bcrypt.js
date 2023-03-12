const bcrypt = require("bcryptjs");

function hash(pass) {
    const hashedPass = bcrypt.hashSync(pass, 9);
    return hashedPass;
}

function compare(pass, hashedPass) {
    return bcrypt.compareSync(pass, hashedPass);
}

module.exports = {
    hash,
    compare,
};
