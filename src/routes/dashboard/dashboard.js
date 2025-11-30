import { getBarData, getLineData, getRecentActivities, getSummary } from "../../controllers/dashboard/dashboardController.js"
import { authMiddleware } from "../../middleware/authMiddleware.js"

export const DashboardRouter = async (req, res) => {
    const url = req.url
    const method = req.method

    if ((url === "/api/v1/dashboard/summary" || url === "/api/v1/dashboard/summary/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return getSummary(req, res)
    }

    if ((url === "/api/v1/dashboard/recent-activities" || url === "/api/v1/dashboard/recent-activities/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return getRecentActivities(req, res)
    }

    if ((url === "/api/v1/dashboard/line" || url === "/api/v1/dashboard/line/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return getLineData(req, res)
    }

    if ((url === "/api/v1/dashboard/bar" || url === "/api/v1/dashboard/bar/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return getBarData(req, res)
    }

}