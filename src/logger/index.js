import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"
import { join } from "path"

const transports = [
    new winston.transports.Console({
        format: winston.format.simple(),
    }),
]

if (process.env.NODE_ENV !== "production") {
    transports.push(
        new DailyRotateFile({
            filename: join(process.cwd(), "logs", "%DATE%-app.log"),
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "10m",
            maxFiles: "14d",
        })
    )

    transports.push(
        new DailyRotateFile({
            level: "error",
            filename: join(process.cwd(), "logs", "%DATE%-app-errors.log"),
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "10m",
            maxFiles: "14d",
        })
    )
}

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports,
})

export default logger