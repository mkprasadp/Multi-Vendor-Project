import mongoose from "mongoose";

const ProductSchema = mongoose.Schema({
    vendor:{type:mongoose.Schema.ObjectId,ref:"Vendor",required:true},
    name:{type:String,required:true},
    desc:{type:String,required:true},    
    category:{type:String,required:true},
    image:{type:Array,required:true},
    price:{type:Number,required:true},
    offerprice:{type:Number,required:true},
    stock: {type:Boolean, required:true},
},
{timestamps:true});

export default mongoose.model("Product",ProductSchema);