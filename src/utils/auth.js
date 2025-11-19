import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const SECRET_KEY_JWT = process.env.SECRET_KEY_JWT

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12)
}

export const comparePassword = async (password, hashed) => {
    return await bcrypt.compare(password, hashed)
}

export const generateToken = (payload) => {
    return jwt.sign(payload, SECRET_KEY_JWT, { expiresIn: "1d" })
}