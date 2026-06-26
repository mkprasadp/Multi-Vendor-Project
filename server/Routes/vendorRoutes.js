import express from "express";
import { registerVendor, loginvendor, getallVendor, getVendorById, vendorDashboard, getVendorProducts } from "../Controller/vendorController.js";

const vendorRoutes = express.Router();

vendorRoutes.post("/register",registerVendor);
vendorRoutes.post("/login",loginvendor);
vendorRoutes.get("/all",getallVendor);  
vendorRoutes.get("/:id",getVendorById);
vendorRoutes.get("/dashboard/:id",vendorDashboard);
vendorRoutes.get("/products/:id",getVendorProducts);

export default vendorRoutes;