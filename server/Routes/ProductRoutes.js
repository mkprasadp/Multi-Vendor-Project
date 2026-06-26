import express from "express";
import { addProduct, deleteProduct, getallProducts, ProductList, updateProductStock,updateProduct } from "../Controller/ProductController.js";
import { upload } from "../Middleware/multer.js";

const ProductRoutes = express.Router();

ProductRoutes.post("/add", upload.array("image", 5), addProduct);
ProductRoutes.get("/vendor/:vendorId", ProductList);
ProductRoutes.get("/all",getallProducts);
ProductRoutes.put("/update-stock/:productId",updateProductStock);
ProductRoutes.delete("/delete/:id", deleteProduct);
ProductRoutes.put("/update/:productId", updateProduct);

export default ProductRoutes;