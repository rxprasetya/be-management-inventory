import { checkAuth, signIn, signOut } from "../../controllers/auth/userController.js"
import { authMiddleware } from "../../middleware/authMiddleware.js"

export const UserRouter = async (req, res) => {
    const url = req.url
    const method = req.method

    if ((url === "/api/v1/auth/sign-in" || url === "/api/v1/auth/sign-in/") && method === "POST") {
        return signIn(req, res)
    }

    if ((url === "/api/v1/auth/me" || url === "/api/v1/auth/me/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return checkAuth(req, res)
    }

    if ((url === "/api/v1/auth/sign-out" || url === "/api/v1/auth/sign-out/") && method === "POST") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return signOut(req, res)
    }
}