const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

function createToken(payload) {
    return jwt.sign(payload, secret);
}

function verifyToken(token) {
    return jwt.verify(token, secret);
}

module.exports = { createToken, verifyToken };
