const JWT = require('jsonwebtoken')

const secret = process.env.SECRET

function createToken(user) {
    const payload = {
        id: user.id,
        name: user.name,
        email: user.email
    }

    const token = JWT.sign(payload,secret,{expiresIn:"1d"})

    return token
}

function validateToken(token) {
    return JWT.verify(token,secret)
}

module.exports = {
    createToken,
    validateToken
}