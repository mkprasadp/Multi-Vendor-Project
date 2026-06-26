import React, { useEffect, useState } from "react";
import Sidebar from "../Pages/Sidebar";
import adminApi from "../services/API";
import { Clock, CheckCircle, Truck, PackageCheck, XCircle } from "lucide-react";

/* ─────────────────────────────────────────
   Skeleton Components
───────────────────────────────────────── */
const SkeletonStatCard = () => (
  <div className="bg-gradient-to-r from-gray-200 to-gray-300 p-5 rounded-xl shadow-lg flex justify-between items-center animate-pulse">
    <div className="space-y-2">
      <div className="h-3 w-16 bg-white/40 rounded-full" />
      <div className="h-7 w-10 bg-white/40 rounded-md" />
    </div>
    <div className="w-8 h-8 rounded-full bg-white/40" />
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b">
    <td className="p-4">
      <div className="h-3 w-24 bg-gray-100 rounded-full animate-pulse" />
    </td>
    <td className="p-4">
      <div className="h-3 w-20 bg-gray-100 rounded-full animate-pulse" />
    </td>
    <td className="p-4">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-2.5 w-12 bg-gray-100 rounded-full animate-pulse" />
        </div>
      </div>
    </td>
    <td className="p-4">
      <div className="h-3 w-16 bg-gray-100 rounded-full animate-pulse" />
    </td>
    <td className="p-4">
      <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
    </td>
    <td className="p-4">
      <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
    </td>
    <td className="p-4">
      <div className="h-8 w-28 bg-gray-100 rounded-lg animate-pulse" />
    </td>
    <td className="p-4">
      <div className="h-3 w-20 bg-gray-100 rounded-full animate-pulse" />
    </td>
  </tr>
);

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
const Orders = () => {

  // STATIC VENDOR ID
  const vendor = JSON.parse(localStorage.getItem("vendor"));
  const vendorId = vendor?.id;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // ← ADDED
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();

    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      const res = await adminApi.get(`/api/vendor/dashboard/${vendorId}`);
      if (res.data.success) {
        const newOrders = res.data.dashboard.recentOrders;
        setOrders((prev) =>JSON.stringify(prev) !== JSON.stringify(newOrders) ? newOrders : prev);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // ← ADDED
    }
  };

  // UPDATE STATUS
  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await adminApi.put(`/api/vendor-order/update-status/${orderId}`,{
          orderStatus: status
        }
      );
      if (res.data.success) {
        fetchOrders();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // STATUS COLORS
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-blue-100 text-blue-700";
      case "processing":
        return "bg-purple-100 text-purple-700";
      case "shipped":
        return "bg-indigo-100 text-indigo-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // STATUS COUNTS
  const statusCounts = { pending: 0, accepted: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0};

  orders.forEach((order) => {
    const status = order.orderStatus || "pending";
    if (statusCounts[status] !==undefined) {
      statusCounts[status]++;
    }
  });
  // FILTER LOGIC
  const filteredOrders = selectedStatus === "All" ? orders : orders.filter((order) =>(order.orderStatus ||"pending") === selectedStatus);
  // ACTIVE CARD STYLE
  const isActive = (status) => selectedStatus === status ? "ring-4 ring-black/30 scale-105": "";
  // ← ADDED: SKELETON SCREEN
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-8">

          {/* HEADER SKELETON */}
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <div className="h-8 w-56 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 w-40 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          {/* SHOW ALL BUTTON SKELETON */}
          <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse mb-4" />

          {/* STATUS CARDS SKELETON */}
          <div className="grid grid-cols-5 gap-5 mb-6">
            {[...Array(5)].map((_, i) => (
              <SkeletonStatCard key={i} />
            ))}
          </div>

          {/* TABLE SKELETON */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Customer","Phone","Products","Amount","Payment","Status","Update","Date"].map((h) => (
                    <th key={h} className="p-4">
                      <div className="h-3 w-16 bg-gray-200 rounded-full animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(6)].map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <Sidebar />
      <div className="flex-1 p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Orders Management
            </h1>
            <p className="text-gray-500">
              Manage all customer orders
            </p>
          </div>
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
            Total Orders:
            {" "}
            {orders.length}
          </div>
        </div>
        {/* SHOW ALL */}
        <button onClick={() => setSelectedStatus("All")} className="mb-4 px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 cursor-pointer">
          Show All Orders
        </button>

        {/* STATUS CARDS */}
        <div className="grid grid-cols-5 gap-5 mb-6">
          {/* PENDING */}
          <div onClick={() =>setSelectedStatus("pending")} className={`bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-5 rounded-xl shadow-lg flex justify-between items-center transition cursor-pointer hover:scale-105 ${isActive("pending")}`}>
            <div>
              <p className="text-sm opacity-80">
                Pending
              </p>
              <h2 className="text-2xl font-bold">
                {statusCounts.pending}
              </h2>
            </div>
            <Clock size={32} />
          </div>
          {/* ACCEPTED */}
          <div onClick={() => setSelectedStatus("accepted")}
            className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow-lg flex justify-between items-center transition cursor-pointer hover:scale-105 ${isActive("accepted")}`}>
            <div>
              <p className="text-sm opacity-80">
                Accepted
              </p>
              <h2 className="text-2xl font-bold">
                {statusCounts.accepted}
              </h2>
            </div>
            <CheckCircle size={32} />
          </div>

          {/* PROCESSING */}
          <div onClick={() =>setSelectedStatus("processing")}
            className={`bg-gradient-to-r from-purple-500 to-purple-600 text-white p-5 rounded-xl shadow-lg flex justify-between items-center transition cursor-pointer hover:scale-105 ${isActive("processing")}`}>
            <div>
              <p className="text-sm opacity-80">
                Processing
              </p>
              <h2 className="text-2xl font-bold">
                {statusCounts.processing}
              </h2>
            </div>
            <Truck size={32} />
          </div>

          {/* DELIVERED */}
          <div onClick={() =>setSelectedStatus("delivered")}
            className={`bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-xl shadow-lg flex justify-between items-center transition cursor-pointer hover:scale-105 ${isActive("delivered")}`}>

            <div>
              <p className="text-sm opacity-80">
                Delivered
              </p>
              <h2 className="text-2xl font-bold">
                {statusCounts.delivered}
              </h2>
            </div>
            <PackageCheck size={32} />
          </div>

          {/* CANCELLED */}
          <div onClick={() =>setSelectedStatus("cancelled")}
            className={`bg-gradient-to-r from-red-500 to-red-600 text-white p-5 rounded-xl shadow-lg flex justify-between items-center transition cursor-pointer hover:scale-105 ${isActive("cancelled")}`}>
            <div>
              <p className="text-sm opacity-80">
                Cancelled
              </p>
              <h2 className="text-2xl font-bold">
                {statusCounts.cancelled}
              </h2>
            </div>
            <XCircle size={32} />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Email</th>
                <th className="p-4">Products</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Update </th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-6">
                      No Orders Found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50">

                        {/* CUSTOMER */}
                        <td className="p-4 font-medium">
                          {order.user?.name || order.deliveryAddress ?.name || "N/A"}
                        </td>
                        {/* PHONE */}
                        <td className="p-4">
                          {order.user?.email || order.deliveryAddress ?.email || "N/A"}
                        </td>
                        {/* PRODUCTS */}
                        <td className="p-4">
                          {order.items?.map((p,index) => (
                                <div key={index}className="flex items-center gap-2 mb-2"> 
                                  <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover"/>
                                  <div>
                                    <p className="font-medium">
                                      {p.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Qty:
                                      {" "}
                                      {p.quantity}
                                    </p>
                                  </div>
                                </div>
                              )
                            )
                          }
                        </td>
                        {/* AMOUNT */}
                        <td className="p-4 font-semibold">
                          ₹{order.totalAmount}
                        </td>
                        {/* PAYMENT */}
                        <td className="p-4">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                            {order.paymentStatus}
                          </span>
                        </td>
                        {/* STATUS */}
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        {/* UPDATE */}
                        <td className="p-4">
                          <select value={order.orderStatus} onChange={(e) =>updateOrderStatus(order._id,e.target.value)} className="border rounded-lg px-3 py-2 outline-none">
                            <option value="pending">
                              Pending
                            </option>
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

                        {/* DATE */}
                        <td className="p-4 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  )
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;