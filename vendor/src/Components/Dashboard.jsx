import React, { useEffect, useState } from "react";
import Sidebar from "../Pages/Sidebar";
import Navbar from "../Pages/Navbar";
import StatCard from "./StatCard";
import DashboardChart from "./DashboardChart";
import API from "../services/API";
import { toast } from "react-toastify";

const Dashboard = () => {

  const vendor = JSON.parse(localStorage.getItem("vendor"));
  // Temporary Static Vendor ID
  const vendorId = vendor?.id;
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Dashboard
  const fetchDashboard = async () => {
    try {
      const res = await API.get(
        `/api/vendor/dashboard/${vendorId}`
      );
      if(res.data.success){
        setDashboard(res.data.dashboard);
      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  // Update Order Status
  const updateOrderStatus = async (
    orderId,
    status
  ) => {

    try {

      const res = await API.put(
        `/api/vendor-order/update-status/${orderId}`,
        {
          orderStatus: status
        }
      );

      toast.success(res.data.message);

      fetchDashboard();

    } catch (error) {

      console.log(error);

      toast.error("Failed To Update Status");

    }
  };

  useEffect(() => {

    fetchDashboard();

  }, []);

  // Loading
  if (loading) {

    return (
      <div className="flex justify-center items-center h-screen text-3xl font-bold">
        Loading...
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

          {/* Welcome */}
          <div className="mb-8">

            <h2 className="text-4xl font-bold">

              Welcome,
              <span className="text-cyan-600 ml-2">
                {dashboard?.vendorInfo?.name}
              </span>

              👋

            </h2>

            <p className="text-gray-500 mt-2 text-lg">
              Manage your products, orders and revenue
            </p>

          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">

            <StatCard
              title="Products"
              value={dashboard?.statistics?.totalProducts}
            />

            <StatCard
              title="Orders"
              value={dashboard?.statistics?.totalOrders}
            />

            <StatCard
              title="Delivered"
              value={dashboard?.statistics?.deliveredOrders}
            />

            <StatCard
              title="Pending"
              value={dashboard?.statistics?.pendingOrders}
            />

            <StatCard
              title="Cancelled"
              value={dashboard?.statistics?.cancelledOrders}
            />

            <StatCard
              title="Revenue"
              value={`₹${dashboard?.statistics?.totalRevenue}`}
            />

          </div>

          {/* Chart */}
          <div className="mt-8">

            <DashboardChart
              statistics={dashboard?.statistics}
            />

          </div>

          {/* Recent Orders */}
          <div className="bg-white shadow-lg rounded-xl mt-8 p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                Recent Orders
              </h2>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="bg-gray-100 text-left">

                    <th className="p-4">
                      Customer
                    </th>

                    <th className="p-4">
                      Product
                    </th>

                    <th className="p-4">
                      Amount
                    </th>

                    <th className="p-4">
                      Payment
                    </th>

                    <th className="p-4">
                      Status
                    </th>

                    <th className="p-4">
                      Update
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {
                    dashboard?.recentOrders?.map((order) => (

                      <tr
                        key={order._id}
                        className="border-b hover:bg-gray-50 transition"
                      >

                        {/* Customer */}
                        <td className="p-4">

                          <div>

                            <p className="font-semibold">
                              {order?.user?.name}
                            </p>

                            <p className="text-sm text-gray-500">
                              {order?.user?.email}
                            </p>

                          </div>

                        </td>

                        {/* Product */}
                        <td className="p-4">

                          <div className="flex items-center gap-4">

                            <img
                              src={order?.items[0]?.image}
                              alt=""
                              className="w-16 h-16 rounded-lg object-cover border"
                            />

                            <div>

                              <p className="font-semibold">
                                {order?.items[0]?.name}
                              </p>

                              <p className="text-sm text-gray-500">
                                Qty:
                                {" "}
                                {order?.items[0]?.quantity}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Amount */}
                        <td className="p-4 font-bold text-lg">

                          ₹{order?.totalAmount}

                        </td>

                        {/* Payment */}
                        <td className="p-4">

                          <span className="capitalize bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">

                            {order?.paymentStatus}

                          </span>

                        </td>

                        {/* Status */}
                        <td className="p-4">

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold

                            ${
                              order?.orderStatus === "delivered"
                                ? "bg-green-100 text-green-700"

                              : order?.orderStatus === "processing"
                                ? "bg-purple-100 text-purple-700"

                              : order?.orderStatus === "shipped"
                                ? "bg-indigo-100 text-indigo-700"

                              : order?.orderStatus === "accepted"
                                ? "bg-cyan-100 text-cyan-700"

                              : order?.orderStatus === "pending"
                                ? "bg-yellow-100 text-yellow-700"

                              : "bg-red-100 text-red-700"
                            }

                            `}
                          >

                            {order?.orderStatus}

                          </span>

                        </td>

                        {/* Update Status */}
                        <td className="p-4">
                          <select value={order?.orderStatus} onChange={(e) =>updateOrderStatus(order._id,e.target.value)} className="border px-3 py-2 rounded-lg outline-none">
                            <option value="accepted">
                              Accepted
                            </option>
                            <option value="processing">
                              Processing
                            </option>
                            <option value="shipped">
                              Shipped
                            </option>
                            <option value="delivered">
                              Delivered
                            </option>
                            <option value="cancelled">
                              Cancelled
                            </option>
                          </select>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;