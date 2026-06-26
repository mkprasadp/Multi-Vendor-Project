import express from "express";
import { addToCart, clearCart, getCart, removeFromCart, updateCartQuantity } from "../Controller/CartController.js";

const CartRouter = express.Router();

CartRouter.post("/add", addToCart);
CartRouter.get("/my-cart", getCart);
CartRouter.delete("/remove/:productId",removeFromCart);
CartRouter.put("/update/:productId",updateCartQuantity);
CartRouter.delete("/clear",clearCart);

export default CartRouter;