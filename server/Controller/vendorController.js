import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Vendor from '../Model/Vendor.js'
import VendorOrder from '../Model/VendorOrder.js';
import Product from '../Model/Product.js';

const SECRET = "vendorsecret";

export const registerVendor = async(req,res)=>{
    try {
        const {name,email,password,phone,address,storeName,storeDescription} = req.body;
        if(!name || !email || !password || !phone || !address || !storeName || !storeDescription){
            return res.json({
                success:false,
                message:"All fields are required"
            })
        }
        const existingVendor = await Vendor.findOne({email,phone});
        if(existingVendor){
            return res.json({
                success:false,
                message:"Vendor already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newVendor = new Vendor({
            name,
            email,
            password:hashedPassword,
            phone,
            address,
            storeName,
            storeDescription,
            isActive:true
        })
        await newVendor.save();
        return res.json({
            success:true,
            message:"Vendor registered successfully",
            vendor:{
                id:newVendor._id,
                name:newVendor.name,
                email:newVendor.email,
                phone:newVendor.phone,
                address:newVendor.address,
                storeName:newVendor.storeName,
                storeDescription:newVendor.storeDescription,
                status:newVendor.status
            }
        })
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export const loginvendor = async(req,res)=>{
    try {
        const {email,password} = req.body;
        const vendor = await Vendor.findOne({email});
        if(!vendor){
            return res.json({
                success:false,
                message:"Vendor not found"
            })
        }
        const isMatch = await bcrypt.compare(password,vendor.password);
        if(!isMatch){
            return res.json({
                success:false,
                message:"Invalid credentials"
            })
        }
        const token = jwt.sign({id:vendor._id},SECRET,{expiresIn:"1d"});
        return res.json({
            success:true,
            message:"Vendor logged in successfully",
            token,
            vendor:{
                id:vendor._id,
                name:vendor.name,
                email:vendor.email,
                phone:vendor.phone,
                address:vendor.address,
                storeName:vendor.storeName,
                storeDescription:vendor.storeDescription,
                status:vendor.status
            }
        })
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export const getallVendor = async(req,res)=>{
    try {
        const vendors = await Vendor.find().populate("owner","name email");
        return res.json({
            success:true,
            message:"Vendors fetched successfully",
            vendors
        })
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export const getVendorById = async(req,res)=>{
    try {
        const vendor = await Vendor.findById(req.params.id);
        if(!vendor){
            return res.json({
                success:false,
                message:"Vendor not found"
            })
        }
        return res.json({
            success:true,
            message:"Vendor fetched successfully",
            vendor
        })
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export const vendorDashboard = async (req, res) => {
    try {

        const vendorId = req.params.id;

        // Check Vendor Exists
        const vendor = await Vendor.findById(vendorId);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }
        // Total Products
        const totalProducts = await Product.countDocuments({
            vendor: vendorId
        });

        // Total Orders
        const totalOrders = await VendorOrder.countDocuments({
            vendor: vendorId
        });

        // Delivered Orders
        const deliveredOrders = await VendorOrder.countDocuments({
            vendor: vendorId,
            orderStatus: "delivered"
        });

        // Pending Orders
        const pendingOrders = await VendorOrder.countDocuments({
            vendor: vendorId,
            orderStatus: "pending"
        });

        // Cancelled Orders
        const cancelledOrders = await VendorOrder.countDocuments({
            vendor: vendorId,
            orderStatus: "cancelled"
        });

        // Total Revenue (Only Delivered + Paid Orders)
        const revenueData = await VendorOrder.aggregate([
            {
                $match: {
                    vendor: vendor._id,
                    paymentStatus: "paid",
                    orderStatus: "delivered"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$totalAmount"
                    }
                }
            }
        ]);

        const totalRevenue =
            revenueData.length > 0
                ? revenueData[0].totalRevenue
                : 0;

        // Recent Orders
        const recentOrders = await VendorOrder.find({
            vendor: vendorId
        })
            .populate("user", "name email phone")
            .sort({ createdAt: -1 })
            .limit(5);

        // Update Vendor Statistics
        vendor.totalRevenue = totalRevenue;
        vendor.totalOrders = totalOrders;
        vendor.deliveredOrders = deliveredOrders;
        vendor.cancelledOrders = cancelledOrders;
        vendor.pendingOrders = pendingOrders;

        await vendor.save();

        // Response
        return res.status(200).json({
            success: true,
            message: "Vendor dashboard fetched successfully",

            dashboard: {
                vendorInfo: {
                    id: vendor._id,
                    name: vendor.name,
                    email: vendor.email,
                    phone: vendor.phone,
                    storeName: vendor.storeName,
                    address: vendor.address,
                    status: vendor.status
                },

                statistics: {
                    totalProducts,
                    totalOrders,
                    deliveredOrders,
                    pendingOrders,
                    cancelledOrders,
                    totalRevenue
                },

                recentOrders
            }
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getVendorProducts = async(req,res)=>{
    try {
        const vendorId = req.vendorId;
        const vendorProducts = await Product.find({vendor: req.params.id});
        return res.json({
            success: true,
            message: "Vendor products fetched successfully",
            totalProducts: vendorProducts.length,
            vendorProducts
        });
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export default { registerVendor, loginvendor, getallVendor, getVendorById, vendorDashboard, getVendorProducts }