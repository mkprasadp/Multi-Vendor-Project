import axios from "axios";

const API = axios.create({
  baseURL: "https://multi-vendor-project-2fua.vercel.app/api" || "http://localhost:5000/api"
});


export default API;
