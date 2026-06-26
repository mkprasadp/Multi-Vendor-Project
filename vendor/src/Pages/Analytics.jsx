import React, { useEffect, useState } from "react";
import Sidebar from "../Pages/Sidebar";
import Navbar from "../Pages/Navbar";
import API from "../services/API";
import RevenueChart from "../Components/RevenueChart";

const Analytics = () => {
  const vendor = JSON.parse(localStorage.getItem("vendor"));

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await API.get(`/api/analytics/analytics/${vendor.id}`);
      setSales(res.data.monthlyRevenue || []);
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl font-bold">
        Loading Analytics...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Navbar */}
        <Navbar />

        <div className="p-6 overflow-y-auto">

          <h1 className="text-3xl font-bold mb-6">
            📊 Analytics Dashboard
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-gray-500">
                Total Months
              </h3>
              <h2 className="text-3xl font-bold text-cyan-600 mt-2">
                {sales.length}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-gray-500">
                Total Revenue
              </h3>
              <h2 className="text-3xl font-bold text-green-600 mt-2">
                ₹{sales.reduce((a, b) => a + b, 0)}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-gray-500">
                Best Month Revenue
              </h3>
              <h2 className="text-3xl font-bold text-purple-600 mt-2">
                ₹{Math.max(...sales, 0)}
              </h2>
            </div>

          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <RevenueChart sales={sales} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;