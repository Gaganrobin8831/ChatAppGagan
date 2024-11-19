const { validateToken } = require("./valdiate.middleware")


function checkAuth(req,res,next) {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }


    try {
        const userPayload = validateToken(token)
        req.user = userPayload
        next()
    } catch (error) {
        return res.status(500).json({ message: 'Sonething Wrong' })
    }


}

module.exports = {
    checkAuth
}
