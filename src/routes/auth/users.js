import { checkAuth, signIn, signOut } from "../../controllers/auth/userController.js"
import { authMiddleware } from "../../middleware/authMiddleware.js"
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js"

export const UserRouter = async (req, res) => {
    const url = req.url
    const method = req.method

    if ((url === "/api/v1/auth/sign-in" || url === "/api/v1/auth/sign-in/") && method === "POST") {
        const checkAuth = await checkAuthMiddleware(req, res)
        if (!checkAuth) return
        return signIn(req, res)
    }

    if ((url === "/api/v1/auth/me" || url === "/api/v1/auth/me/") && method === "GET") {
        return checkAuth(req, res)
    }

    if ((url === "/api/v1/auth/sign-out" || url === "/api/v1/auth/sign-out/") && method === "POST") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return signOut(req, res)
    }
}