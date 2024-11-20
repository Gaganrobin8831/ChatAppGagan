const User = require("../models/user.models")
const { validateToken } = require("./valdiate.middleware")


async function checkAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }


    try {
        const userPayload = validateToken(token)
        req.user = userPayload
        const { _id } = req.user
        const user = await User.findById(_id);

        if (user.token === null) {
            return errorResponse(res, "error", "User not found", 404);
        }
        next()
    } catch (error) {
        return res.status(500).json({ message: 'Sonething Wrong' })
    }


}

module.exports = {
    checkAuth
}
