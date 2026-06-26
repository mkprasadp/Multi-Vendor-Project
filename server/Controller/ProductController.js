import Product from "../Model/Product.js";
import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../config/S3.js";

export const addProduct = async (req, res) => {
  try {
    const { vendor, name, desc, category, price, offerprice, stock } = req.body;
    const files = req.files;
    let imageUrls = [];
    for (const file of files) {
      const fileContent = fs.readFileSync(file.path);
      const fileName = `products/${Date.now()}-${file.originalname}`;
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
        ContentType:file.mimetype,
      };
      await s3.send(new PutObjectCommand(params));
      const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
      imageUrls.push(imageUrl);
    }

    const product =
      await Product.create({
        vendor,
        name,
        desc,
        category,
        image: imageUrls,
        price,
        offerprice,
        stock,
      });

    res.status(201).json({
      success: true,
      message: "Product Added",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });

  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete images from AWS S3
    for (const imageUrl of product.image) {
      // Extract file key from URL
      const imageKey = imageUrl.split(".com/")[1];
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: imageKey,
      };

      await s3.send( new DeleteObjectCommand(params));
    }

    // Delete product from MongoDB
    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message:
        "Product and AWS images deleted",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getallProducts = async(req,res)=>{
  try {
    const all = await Product.find();
    return res.json({
      success:true,
      message:"All Products from Vendor",
      count:all.length,
      all
    })
  } catch (error) {
    return res.json({
      success:false,
      message:error.message
    })
  }
}

export const updateProductStock  = async(req,res)=>{
  try {
    const { productId } = req.params;
    const { stock } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    product.stock = stock;
    await product.save();
    return res.status(200).json({
      success: true,
      message: `Product marked as ${stock ? "In Stock" : "Out Of Stock"}`,
      product
    });
  } catch (error) {
    return res.json({
      success:false,
      message:error.message
    })
  }
}


export const ProductList = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const products = await Product.find({
      vendor: vendorId,
    })
      .populate("category")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ─────────────────────────────────────────
   PUT /api/Product/update/:productId
───────────────────────────────────────── */
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, offerprice, stock, image } = req.body;

    // ── Validate ──
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Product name is required" });
    }
    if (price === undefined || Number(price) < 0) {
      return res.status(400).json({ success: false, message: "A valid price is required" });
    }
    if (offerprice === undefined || Number(offerprice) < 0) {
      return res.status(400).json({ success: false, message: "A valid offer price is required" });
    }
    if (Number(offerprice) > Number(price)) {
      return res.status(400).json({ success: false, message: "Offer price cannot exceed the original price" });
    }

    // ── Normalise image to array ──
    const imageArray = image
      ? Array.isArray(image) ? image : [image]
      : undefined;

    // ── Build update payload ──
    const updates = {
      name: name.trim(),
      price: Number(price),
      offerprice: Number(offerprice),
      ...(description !== undefined && { description: description.trim() }),
      ...(stock !== undefined && { stock: Boolean(stock) }),
      ...(imageArray && { image: imageArray }),
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("category", "category_name");

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("updateProduct:", error);
    return res.status(500).json({ success: false, message: "Failed to update product" });
  }
};

export default { addProduct, deleteProduct, ProductList, updateProductStock, updateProduct };