export const msgError = (res, code, message, e) => {
    res.writeHead(code, { "Content-Type": "application/json" })
    res.end(JSON.stringify({
        success: false,
        message,
        error: e ?? message
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