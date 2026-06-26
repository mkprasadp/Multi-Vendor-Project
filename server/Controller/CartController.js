import Cart from "../Model/Cart.js";
import Product from "../Model/Product.js";


export const addToCart = async(req,res)=>{
    try {

        const { userId, productId, quantity } = req.body;

        const product = await Product.findById(productId);

        if(!product){
            return res.json({
                success:false,
                message:"Product not found"
            })
        }

        let cart = await Cart.findOne({ user:userId });

        if(!cart){
            cart = await Cart.create({
                user:userId,
                items:[]
            });
        }

        const existingProduct = cart.items.find(
            item => item.product.toString() === productId
        );

        if(existingProduct){
            existingProduct.quantity += quantity || 1;
        }else{
            cart.items.push({
                product:productId,
                quantity:quantity || 1
            });
        }

        await cart.save();

        return res.json({
            success:true,
            message:"Product added to cart",
            cart
        });

    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export const getCart = async(req,res)=>{
    try {
        const cart = await Cart.findOne({user:req.user.id}).populate({
            path:"items.product",
            populate:{
                path:"vendor",
                select:"storeName"
            }
        })
        return res.status(200).json({
            success:true,
            message:"Cart retrieved",
            cart
        });
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}


export const removeFromCart = async(req,res)=>{
    try {
        const cart = await Cart.findOne({user:req.user.id});
        if(!cart){
            return res.json({
                success:false,
                message:"Cart not found"
            })
        }
        cart.items = cart.items.filter(item=>item.product.toString()!==req.params.productId);
        await cart.save();
        return res.json({
            success:true,
            message:"Product removed from cart",
            cart
        })
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export const updateCartQuantity = async(req,res)=>{
    try {
        const { quantity } = req.body;

        const cart = await Cart.findOne({user:req.user.id});
        if(!cart){
            return res.json({
                success:false,
                message:"Cart not found"
            })
        }

        const item = cart.items.find(item=>item.product.toString()===req.params.productId);
        if(!item){
            return res.json({
                success:false,
                message:"Product not found in cart"
            })
        }

        item.quantity = quantity;
        await cart.save();
        return res.json({
            success:true,
            message:"Cart updated",
            cart
        })
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export const clearCart = async(req,res)=>{
    try {
        const cart = await Cart.findOne({user:req.user.id});
        if(!cart){
            return res.json({
                success:false,
                message:"Cart not found"
            })
        }
        cart.items = [];
        await cart.save();
        return res.json({
            success:true,
            message:"Cart cleared",
            cart
        })
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export default { addToCart, getCart, removeFromCart, updateCartQuantity, clearCart };