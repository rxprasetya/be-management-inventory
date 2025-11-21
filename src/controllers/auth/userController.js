import db from "../../config/db.js"
import { users } from "../../schema.js"
import { msgError, msgSuccess, parseBody } from "../../utils/helper.js"
import { eq } from "drizzle-orm"
import { userValidator } from "../../validators/index.js"
import { comparePassword, generateToken } from "../../utils/auth.js"

export const signIn = async (req, res) => {
    try {
        const body = await parseBody(req)

        const validation = userValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { username, password } = validation.data

        const result = await db
            .select({
                id: users.id,
                username: users.username,
                password: users.password,
                role: users.role
            })
            .from(users)
            .where(eq(users.username, username))

        const user = result[0]

        if (!user) return msgError(res, 400, "Invalid username or password")

        const { id: userID, password: userPassword, role: userRole } = user

        const valid = await comparePassword(password, userPassword)

        if (!valid) return msgError(res, 400, "Invalid username or password")

        await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userID))

        const token = generateToken({ id: userID, role: userRole })

        return msgSuccess(res, 200, `Sign in success`, {
            id: userID,
            username,
            role: userRole,
            token
        })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}