import Coupon from "../Model/Coupon.js";

export const createCoupon = async (req,res) => {
  try {
    const { vendor, code, discount, minOrderAmount, expiryDate,} = req.body;

    const coupon = await Coupon.create({
      vendor,
      code,
      discount,
      minOrderAmount,
      expiryDate,
    });

    res.status(201).json({
      success: true,
      coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVendorCoupons = async (req, res) => {
    try {
    const { vendorId } = req.params;

    const coupons = await Coupon.find({vendor: vendorId,}).sort({createdAt: -1,});
    
    res.json({
        success: true,
        message:"Coupons added Successfully",
        coupons,
      });
    } catch (error) {
    res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};

export const deleteCoupon = async (req, res) => {
    try {
      await Coupon.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message:"Coupon Deleted Successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };