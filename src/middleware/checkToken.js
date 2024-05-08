const jwt = require('jsonwebtoken')
require('dotenv').config()

const checkToken = (req, res, next) => {

    let accessToken = req.headers?.authorization
    // check missing tokenn
    if (!accessToken) return res.status(400).json({
        error: true,
        message: 'Missing access token !'
    })
    let tokenRegex = /^(Bearer)\s[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/
    // check legal token
    if (!tokenRegex.test(accessToken)) return res.status(401).json({
        stauts: 1,
        message: 'Token is illegal !'
    })

    let token = accessToken.split(' ')[1]
    jwt.verify(token, process.env.SECRET_KEY_JWT, (err, decode) => {
        if (err) {
            return res.status(401).json({
                error: false,
                message: 'Verify Failed !!!'
            })
        }
        req.user = decode
        next()
    })
}

module.exports = checkToken;
