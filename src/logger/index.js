import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"
import { join } from "path"

const transportInfo = new DailyRotateFile({
    filename: join(process.cwd(), "logs", "%DATE%-app.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "14d",
})

const transportError = new DailyRotateFile({
    level: "error",
    filename: join(process.cwd(), "logs", "%DATE%-app-errors.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "14d",
})

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        transportInfo,
        transportError,
        process.env.NODE_ENV !== "production" &&
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
})

export default logger