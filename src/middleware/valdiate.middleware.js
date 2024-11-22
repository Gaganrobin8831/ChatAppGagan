const JWT = require('jsonwebtoken')

const secret = process.env.SECRET

function createToken(admin) {
    const payload = {
        id: admin._id,
        name: admin.name,
        email: admin.email
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