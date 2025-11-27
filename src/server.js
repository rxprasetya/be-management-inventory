import "dotenv/config"
import http from "http"
import { msgError, msgSuccess } from "./utils/helper.js"
import { UserRouter } from "./routes/auth/users.js"
import { ProductRouter } from "./routes/master/products.js"
import { CategoryRouter } from "./routes/master/categories.js"
import { WarehouseRouter } from "./routes/master/warehouses.js"
import { StockLevelRouter } from "./routes/stock/stockLevels.js"
import { StockInRouter } from "./routes/stock/stockIn.js"
import { StockOutRouter } from "./routes/stock/stockOut.js"
import { InventoryRouter } from "./routes/inventory/inventories.js"

const port = process.env.NODE_PORT

const server = http.createServer((req, res) => {
    const url = req.url
    const method = req.method

    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173")
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

    if (method === "OPTIONS") return res.writeHead(204).end()

    if (url === "/" && method === "GET") {
        return msgSuccess(res, 200, `Welcome to Management Inventory API, created by @rxprasetya`)
    }
    if (url?.startsWith("/api/v1/auth")) return UserRouter(req, res)
    if (url?.startsWith("/api/v1/categories")) return CategoryRouter(req, res)
    if (url?.startsWith("/api/v1/products")) return ProductRouter(req, res)
    if (url?.startsWith("/api/v1/warehouses")) return WarehouseRouter(req, res)
    if (url?.startsWith("/api/v1/inventories")) return InventoryRouter(req, res)
    if (url?.startsWith("/api/v1/stock-levels")) return StockLevelRouter(req, res)
    if (url?.startsWith("/api/v1/stock-in")) return StockInRouter(req, res)
    if (url?.startsWith("/api/v1/stock-out")) return StockOutRouter(req, res)

    return msgError(res, 404, `Route not found`)
})

if (process.env.NODE_ENV !== "production")
    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`)
    })

export default server