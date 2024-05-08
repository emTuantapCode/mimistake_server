const jwt = require('jsonwebtoken')
require('dotenv').config()

const genToken = (id, expiresIn ) => {
 return jwt.sign({ id: id }, process.env.SECRET_KEY_JWT, { expiresIn: expiresIn })
}

module.exports = genToken;
