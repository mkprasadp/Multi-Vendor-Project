import Cart from "../Model/Cart.js";
import Product from "../Model/Product.js";
import VendorOrder from "../Model/VendorOrder.js";
import Order from "../Model/MainOrder.js";


// ======================================
// PLACE ORDER
// ======================================

export const placeOrder = async (req, res) => {
    try {
        const userId = "6a1932fc461f99b0526f39e3";

        const {
            name,
            phone,
            address,
            paymentMethod
        } = req.body;

        // GET CART
        const cart = await Cart.findOne({
            user: userId
        }).populate({
            path: "items.product",
            populate: {
                path: "vendor"
            }
        });

        if (!cart || cart.items.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        // GROUP PRODUCTS
        const groupedProducts = {};

        const orderItems = [];

        let grandTotal = 0;

        // LOOP CART
        for (const item of cart.items) {

            const product = item.product;

            const vendorId =
                product.vendor._id.toString();

            const price =
                product.offerprice > 0
                    ? product.offerprice
                    : product.price;

            const totalPrice =
                price * item.quantity;

            grandTotal += totalPrice;

            const productData = {

                product: product._id,

                vendor: product.vendor._id,

                quantity: item.quantity,

                price,

                totalPrice,

                name: product.name,

                image: product.image?.[0]
            };

            orderItems.push(productData);

            // GROUP BY VENDOR
            if (!groupedProducts[vendorId]) {

                groupedProducts[vendorId] = [];
            }

            groupedProducts[vendorId]
                .push(productData);
        }

        // CREATE MAIN ORDER
        const mainOrder = await Order.create({

            user: userId,

            items: orderItems,

            totalAmount: grandTotal,

            paymentMethod,

            paymentStatus: "paid",

            deliveryAddress: {
                name,
                phone,
                address
            }
        });

        // CREATE VENDOR ORDERS
        const vendorOrderIds = [];

        for (const vendorId in groupedProducts) {

            const vendorItems =
                groupedProducts[vendorId];

            const subtotal =
                vendorItems.reduce(

                    (acc, item) =>
                        acc + item.totalPrice,

                    0
                );

            const vendorOrder =
                await VendorOrder.create({

                    mainOrder: mainOrder._id,

                    user: userId,

                    vendor: vendorId,

                    items: vendorItems,

                    subtotal,

                    totalAmount: subtotal,

                    paymentStatus: "paid"
                });

            vendorOrderIds.push(
                vendorOrder._id
            );
        }

        // UPDATE MAIN ORDER
        mainOrder.vendorOrders =
            vendorOrderIds;

        await mainOrder.save();

        // CLEAR CART
        cart.items = [];

        await cart.save();

        return res.status(201).json({

            success: true,

            message:
                "Order placed successfully",

            mainOrder
        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message
        });
    }
};


// ======================================
// GET USER ORDERS
// ======================================

export const getUserOrders = async (req, res) => {
    try {
        const userId = "6a16d10fba6dbeac687244e0";

        const orders = await Order.find({user: userId}).populate("vendorOrders").sort({ createdAt:-1 });
        
        return res.status(200).json({
            success:true,
            orders
        });

    } catch (error) {

        return res.status(500).json({

            success:false,

            message:error.message
        });
    }
};