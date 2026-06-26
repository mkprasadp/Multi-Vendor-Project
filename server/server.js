import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js';
import connectCloudinary from './config/cloudinary.js';
import userRoutes from './Routes/userRoutes.js';
import vendorRoutes from './Routes/vendorRoutes.js';
import ProductRoutes from './Routes/ProductRoutes.js';
import CartRouter from './Routes/cartRoutes.js';
import OrderRoutes from './Routes/orderRoutes.js';
import VendorOrderRoutes from './Routes/VendorOrderRoutes.js';
import AnalyticsRouter from './Routes/VendorAnalyticsRoutes.js';
import CouponsRoutes from './Routes/CouponRoutes.js';

const app = express();
const PORT = 5000;

dotenv.config();
app.use(cors());
app.use(express.json());

await connectDB();
await connectCloudinary();

app.use("/api/user",userRoutes);
app.use("/api/vendor",vendorRoutes);
app.use("/api/product", ProductRoutes)
app.use("/api/cart",CartRouter);
app.use("/api/order",OrderRoutes);
app.use("/api/vendor-order", VendorOrderRoutes);
app.use("/api/analytics", AnalyticsRouter);
app.use("/api/coupon",CouponsRoutes)


app.get('/',(req,res)=>{
    res.json({
        success:true,
        message:"message from backend"
    })
})

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})

export default app;