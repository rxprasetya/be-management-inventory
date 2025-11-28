export const msgError = (res, code, message, e) => {

    const isErrorObject = e instanceof Error
    const statusCode = isErrorObject ? 400 : code
    const errorMessage = isErrorObject ? e.message : message

    res.writeHead(statusCode, { "Content-Type": "application/json" })
    res.end(JSON.stringify({
        success: false,
        message: errorMessage,
        error: errorMessage
    }))
}

export const msgSuccess = (res, code, message, data) => {
    res.writeHead(code, { "Content-Type": "application/json" })
    res.end(JSON.stringify({
        success: true,
        message,
        data
    }))
}

export const parseBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = ""
        req.on("data", chunk => { body += chunk })
        req.on("end", () => {
            try {
                resolve(JSON.parse(body))
            } catch (err) {
                reject(err)
            }
        })
    })
}

export function parseCookies(req) {
    const list = {}
    const cookieHeader = req.headers.cookie

    if (!cookieHeader) return list

    cookieHeader.split(";").forEach(cookie => {
        const parts = cookie.split("=")
        const key = parts.shift().trim()
        const value = decodeURIComponent(parts.join("="))
        list[key] = value
    })

    return list
}