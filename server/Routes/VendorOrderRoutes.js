import express from "express";

import { getVendorOrders, updateVendorOrderStatus } from "../Controller/VendorOrderController.js";

const VendorOrderRoutes = express.Router();

VendorOrderRoutes.get("/vendor-orders",getVendorOrders);
VendorOrderRoutes.put("/update-status/:orderId", updateVendorOrderStatus);

export default VendorOrderRoutes;