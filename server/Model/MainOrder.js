import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
    items:[
        {
            product:{type:mongoose.Schema.Types.ObjectId, ref:"Product"},
            vendor:{type:mongoose.Schema.Types.ObjectId, ref:"Vendor"},
            quantity:Number,
            price:Number
        }
    ],

    vendorOrders:[{ type:mongoose.Schema.Types.ObjectId, ref:"VendorOrder"}],

    totalAmount:{ type:Number,required:true},
    paymentMethod:{type:String, enum:["COD","online"],default:"COD"},
    paymentStatus:{type:String, enum:["pending","paid"], default:"pending"},

    orderStatus:{type:String, enum:["pending","confirmed","shipped","delivered","cancelled"], default:"pending"},

    deliveryAddress:{
        name:String,
        phone:String,
        address:String
    }
},
{timestamps:true}
)

export default mongoose.model("Order",orderSchema);