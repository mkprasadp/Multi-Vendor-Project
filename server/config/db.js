import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        await mongoose.connection.on("connected",()=>{
            console.log("Database Connected Successfully")
        })
        await mongoose.connect("mongodb+srv://fullstack:fullstack@cluster0.ukoo4h0.mongodb.net")
    } catch (error) {
        console.log(error.message);
    }
}

export default connectDB;