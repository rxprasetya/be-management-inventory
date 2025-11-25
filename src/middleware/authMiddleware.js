import jwt from "jsonwebtoken"
import { msgError, parseCookies } from "../utils/helper.js"
import { SECRET_KEY_JWT } from "../utils/auth.js"

export const authMiddleware = (req, res, roles = []) => {
    // const authHeader = req.headers.authorization
    // if (!authHeader) {
    //     msgError(res, 401, "No token provided")
    //     return false
    // }
    // const token = authHeader.split(" ")[1]
    const cookies = parseCookies(req)
    const token = cookies.token

    if (!token) {
        msgError(res, 401, "No token provided")
        return false
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY_JWT)
        req.user = decoded

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            msgError(res, 403, "Forbidden access")
            return false
        }

        return true
    } catch (error) {
        msgError(res, 401, "Invalid token")
        return false
    }
}