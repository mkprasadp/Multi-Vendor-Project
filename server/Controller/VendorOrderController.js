import VendorOrder from "../Model/VendorOrder.js";
import Order from "../Model/MainOrder.js";


// ======================================
// GET VENDOR ORDERS
// ======================================

export const getVendorOrders = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const filter = vendorId ? { vendor: vendorId } : {}; // no vendorId -> all orders (admin dashboard)
        const orders = await VendorOrder.find(filter)
            .populate("user", "name email")
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// ======================================
// UPDATE VENDOR ORDER STATUS
// ======================================

export const updateVendorOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;
        const vendorOrder = await VendorOrder.findById(orderId)

        if (!vendorOrder) {
            return res.status(404).json({
                success:false,
                message:
                "Vendor Order Not Found"
            });
        }

        // UPDATE STATUS
        vendorOrder.orderStatus = orderStatus;
        await vendorOrder.save();
        // FIND MAIN ORDER
        const mainOrder = await Order.findById(vendorOrder.mainOrder);

        if (mainOrder) {
            const vendorOrders = await VendorOrder.find({
                mainOrder:
                mainOrder._id
            });

            const allDelivered = vendorOrders.every(item => item.orderStatus === "delivered");
            const anyShipped = vendorOrders.some(item =>item.orderStatus === "shipped");
            const anyProcessing = vendorOrders.some(item =>item.orderStatus === "processing");
            const anyCancelled = vendorOrders.some(item =>item.orderStatus === "cancelled");

            // MAIN ORDER STATUS
            if (allDelivered) {
                mainOrder.orderStatus = "delivered";
            } else if (anyShipped) {
                mainOrder.orderStatus = "shipped";
            } else if (anyProcessing) {
                mainOrder.orderStatus = "confirmed";
            } else if (anyCancelled) {
                mainOrder.orderStatus = "cancelled";
            }
            await mainOrder.save();
        }

        return res.status(200).json({
            success:true,
            message: "Vendor Order Updated",
            vendorOrder
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};