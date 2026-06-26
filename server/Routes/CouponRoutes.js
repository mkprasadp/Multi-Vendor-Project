import express from "express";

import {createCoupon, getVendorCoupons,deleteCoupon } from "../Controller/CouponController.js";

const CouponsRoutes = express.Router();

CouponsRoutes.post("/create", createCoupon);
CouponsRoutes.get("/vendor/:vendorId",getVendorCoupons);
CouponsRoutes.delete("/delete/:id", deleteCoupon);

export default CouponsRoutes;