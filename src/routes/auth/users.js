import { signIn } from "../../controllers/auth/userController.js"

export const UserRouter = (req, res) => {
    const url = req.url
    const method = req.method

    if ((url === "/api/v1/auth" || url === "/api/v1/auth/") && method === "POST") {
        return signIn(req, res)
    }
}