import { v2 as cloudinary } from 'cloudinary'

const connectCloudinary = async()=>{
    cloudinary.config({
        cloud_name:"",
        api_key:"",
        api_secret:""
    })
}

export default connectCloudinary;
export{cloudinary}