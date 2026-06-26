import VendorOrder from "../Model/VendorOrder.js";

export const getVendorEarnings = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const orders = await VendorOrder.find({
      vendor: vendorId,
      orderStatus: "delivered",
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const totalOrders = orders.length;

    const today = new Date();

    const todayRevenue = orders
      .filter((order) => {
        const orderDate = new Date(order.createdAt);

        return (
          orderDate.getDate() === today.getDate() &&
          orderDate.getMonth() === today.getMonth() &&
          orderDate.getFullYear() === today.getFullYear()
        );
      })
      .reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );

    res.status(200).json({
      success: true,
      totalRevenue,
      todayRevenue,
      totalOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getVendorAnalytics = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const orders = await VendorOrder.find({
      vendor: vendorId,
      orderStatus: "delivered",
    });

    const monthlyRevenue = Array(12).fill(0);

    orders.forEach((order) => {
      const month = new Date(
        order.createdAt
      ).getMonth();

      monthlyRevenue[month] +=
        order.totalAmount;
    });

    res.status(200).json({
      success: true,
      monthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getDashboardStats = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const orders = await VendorOrder.find({
      vendor: vendorId,
    });

    const delivered = orders.filter(
      (o) => o.orderStatus === "delivered"
    ).length;

    const shipped = orders.filter(
      (o) => o.orderStatus === "shipped"
    ).length;

    const processing = orders.filter(
      (o) => o.orderStatus === "processing"
    ).length;

    const cancelled = orders.filter(
      (o) => o.orderStatus === "cancelled"
    ).length;

    res.json({
      delivered,
      shipped,
      processing,
      cancelled,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};