export const msgError = (res, code, message, e) => {

    const errorMap = {
        400: "ERROR_BAD_REQUEST",
        404: "ERROR_NOT_FOUND",
        409: "ERROR_DUPLICATE",
        500: "ERROR_SERVER",
    }

    res.writeHead(code, { "Content-Type": "application/json" })
    res.end(JSON.stringify({
        success: false,
        message,
        error: errorMap[code] ?? "ERROR_UNKOWN",
        e: process.env.NODE_ENV !== "production" ? e : undefined
    }))
}

export const msgSuccess = (res, code, message, data) => {
    res.writeHead(code, { "Content-Type": "application/json" })
    res.end(JSON.stringify({
        success: true,
        message,
        data: process.env.NODE_ENV !== "production" ? data : undefined
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