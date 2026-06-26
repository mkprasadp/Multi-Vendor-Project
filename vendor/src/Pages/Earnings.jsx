import React, { useEffect, useState } from "react";
import Sidebar from "../Pages/Sidebar";
import Navbar from "../Pages/Navbar";
import API from "../services/API";

const Earnings = () => {
  const vendor = JSON.parse(
    localStorage.getItem("vendor")
  );
  console.log("Vendor:", vendor);

  const [data, setData] = useState(null);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const res = await API.get(
        `/api/analytics/earnings/${vendor.id}`
      );

      if (res.data.success) {
        setData(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-6">

          <h1 className="text-3xl font-bold mb-6">
            💰 Earnings
          </h1>

          <div className="grid md:grid-cols-4 gap-6">

            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-500">
                Total Revenue
              </p>

              <h2 className="text-3xl font-bold text-green-600">
                ₹{data.totalRevenue}
              </h2>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-500">
                Today's Revenue
              </p>

              <h2 className="text-3xl font-bold text-blue-600">
                ₹{data.todayRevenue}
              </h2>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-500">
                Total Orders
              </p>

              <h2 className="text-3xl font-bold text-purple-600">
                {data.totalOrders}
              </h2>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-500">
                Avg Order Value
              </p>

              <h2 className="text-3xl font-bold text-orange-600">
                ₹
                {Math.round(
                  data.totalRevenue /
                  (data.totalOrders || 1)
                )}
              </h2>
            </div>

          </div>

          <div className="bg-white mt-8 rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-4">
              Revenue Summary
            </h2>

            <div className="space-y-4">

              <div className="flex justify-between">
                <span>Total Revenue</span>
                <span>
                  ₹{data.totalRevenue}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Today's Revenue</span>
                <span>
                  ₹{data.todayRevenue}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Total Orders</span>
                <span>
                  {data.totalOrders}
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Earnings;