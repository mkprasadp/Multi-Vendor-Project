import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    Password:{type:String,required:true},
    phone:{type:Number},
    address:{type:String},
    vendor: {type: mongoose.Schema.Types.ObjectId,ref: "Vendor"}
},
{timestamps:true})

export default mongoose.model("User",userSchema);