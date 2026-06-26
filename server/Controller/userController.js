import jwt from 'jsonwebtoken';
import bcrypt  from 'bcryptjs';
import User from '../Model/User.js'

const SECRET = "usersecret";

export const registeruser = async(req,res)=>{
    try {
        const { name,email,Password } = req.body;
        if(!name||!email||!Password){
            return res.json({
                success:false,
                message:"Please fill all the fields"
            })
        }
        const existinguser = await User.findOne({email});
        if(existinguser){
            return res.json({
                success:false,
                message:"User already exists"
            })
        }
        const hashedpasseord = await bcrypt.hash(Password,10);
        const user = await User.create({
            name,
            email,
            Password:hashedpasseord
        })
        await user.save();
        const token = jwt.sign({id:user._id},SECRET,{expiresIn:"1d"})

        return res.json({
            success:true,
            message:"User registered successfully",
            token,
            user:{
                name:user.name,
                email:user.email,
            }
        })
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export const loginUser = async(req,res)=>{
    try {
        const { email, password } = req.body;
        if(!email||!password){
            return res.json({
                success:false,
                message:"Please fill all the fields"
            })
        }
        const user = await User.findOne({email});
        if(!user){
            return res.json({
                success:false,
                message:"User not found"
            })
        }
        const isMatch = await bcrypt.compare(Password, user.Password);
        if(!isMatch){
            return res.json({
                success:false,
                message:"Invalid credentials"
            })
        }
        const token = jwt.sign({id:user._id},SECRET,{expiresIn:"1d"})
        return res.json({
            success:true,
            message:"User logged in successfully",
            token,
            user:{
                name:user.name,
                email:user.email,
            }
        })
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export const getallUser = async(req,res)=>{
    try {
        const user = await User.find();
        const token = jwt.sign({id:user._id},SECRET,{expiresIn:"1d"})
        return res.json({
            success:true,
            message:"Users fetched successfully",
            token,
            user
        })
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export const getUserById = async(req,res)=>{
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        const token = jwt.sign({id:user._id},SECRET,{expiresIn:"1d"})
        return res.json({
            success:true,
            message:"User fetched successfully",
            token,
            user
        })
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export const Updateuser = async(req,res)=>{
    try {
        const { phone,address } = req.body;
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id,{phone,address},{new:true});
        const token = jwt.sign({id:user._id},SECRET,{expiresIn:"1d"})
        return res.json({
            success:true,
            message:"User updated successfully",
            token,
            user
        })
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export default { registeruser, loginUser, getallUser, getUserById, Updateuser};