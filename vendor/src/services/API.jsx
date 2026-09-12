import axios from "axios";

const API = axios.create({
  baseURL: "https://multi-vendor-project-2fua.vercel.app" || "http://3.82.49.150:5001"
});


export default API;
