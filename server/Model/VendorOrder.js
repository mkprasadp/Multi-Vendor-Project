import mongoose from "mongoose";

const vendorOrderSchema = mongoose.Schema({
    mainOrder:{type:mongoose.Schema.Types.ObjectId, ref:"Order"},
    user:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    vendor:{type:mongoose.Schema.Types.ObjectId, ref:"Vendor", required:true},
    items:[{
        product:{type:mongoose.Schema.Types.ObjectId,ref:"Product"},
            name: String,
            image: String,
            quantity:Number,
            price:Number,
            totalPrice: Number
        }
    ],
    subtotal:{ type:Number, default:0},
    deliveryCharge:{type:Number, default:0},
    totalAmount:{type:Number,required:true},
    paymentStatus:{ type:String, enum:["pending","paid","failed"], default:"paid"},
    orderStatus:{type:String,enum:["pending","accepted","processing","shipped","delivered","cancelled"],default:"pending"}
},
{timestamps:true}
)

export default mongoose.model("VendorOrder",vendorOrderSchema);