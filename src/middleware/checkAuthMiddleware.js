import { msgError, parseCookies } from "../utils/helper.js"

export const checkAuthMiddleware = (req, res) => {
    const cookies = parseCookies(req)
    const token = cookies.token
    if (token) {
        msgError(res, 400, "You are already signed in")
        return false
    }
    return true
}