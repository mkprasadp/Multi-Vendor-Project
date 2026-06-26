import express from "express";

import { placeOrder, getUserOrders } from "../Controller/MainOrderController.js";

const MainOrderRoutes = express.Router();

MainOrderRoutes.post("/place", placeOrder);

MainOrderRoutes.get("/my-orders", getUserOrders);

export default MainOrderRoutes;