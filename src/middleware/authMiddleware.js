import jwt from "jsonwebtoken"
import { msgError, parseCookies } from "../utils/helper.js"
import { SECRET_KEY_JWT } from "../utils/auth.js"

export const authMiddleware = (req, res) => {
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
        // if (req.user.role !== "admin") return msgError(res, 401, "Forbidden access") 
        return true
    } catch (error) {
        msgError(res, 401, "Invalid token")
        return false
    }
}