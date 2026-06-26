import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/API";
import Snowfall from 'react-snowfall'

const LoginPage = () => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [loading,setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/api/vendor/login",{ email: Email, password: Password });
      console.log(res.data);
      if(res.data.success){
          const vendor = res.data.vendor;
          /*if (vendor.status.trim().toLowerCase() !== "approved") {
            toast.info("Your account is not approved yet!",{ toastId: "notApproved" });
            setLoading(false);
            return;
          }*/
          localStorage.setItem("vendor", JSON.stringify(vendor));
          toast.success("Login Successfully");
          navigate('/dash');
        }
        else{
          toast.warn(res.data.message || "Invalid credentials");
          setLoading(false);
        }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server Error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <Snowfall color="white"
        snowflakeCount={500}
        speed={[0.5, 3.0]}
        wind={[-0.5, 2.0]}
        radius={[0.5, 3.0]}/>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-[350px] relative">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Vendor Login
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input type="email" placeholder="example@gmail.com" value={Email} onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required/>

          <input type="password" placeholder="Password" value={Password} onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required/>
          <button type="submit" disabled={loading} className={`py-2 rounded-lg font-semibold transition duration-300 cursor-pointer text-white
            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;