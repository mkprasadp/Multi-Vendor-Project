import express from "express";
import { getVendorEarnings, getVendorAnalytics, getDashboardStats } from "../Controller/VendorAnalyticsController.js";

const AnalyticsRouter = express.Router();

AnalyticsRouter.get("/earnings/:vendorId",getVendorEarnings);
AnalyticsRouter.get("/analytics/:vendorId",getVendorAnalytics);
AnalyticsRouter.get("/dashboard-stats/:vendorId",getDashboardStats);

export default AnalyticsRouter;