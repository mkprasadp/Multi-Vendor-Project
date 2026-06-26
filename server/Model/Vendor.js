import mongoose from "mongoose";

const vendorSchema = mongoose.Schema({
    owner:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    //info
    name:{type:String,required:true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone:{type:String,required:true},
    address:{type:String,required:true},
    isActive:{type:Boolean,required:true},

    //store info
    storeName: { type: String, required: true },
    storeDescription: { type: String, required:true },

    //Approve
    status: {type: String, enum: ["pending", "approved", "suspended"],default: "pending"},
    totalrevenue:{type:Number,default:0},
    totalOrders:{type:Number,default:0},
    deliverdOrders:{type:Number,default:0},
    cancellOrders:{type:Number,default:0},
    pendingorders:{type:Number,default:0},

    lastlogin:{type:Date}
},
{timestamps:true})

export default mongoose.model("Vendor",vendorSchema);