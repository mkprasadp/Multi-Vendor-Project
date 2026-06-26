import React, { useEffect, useState } from "react";
import Sidebar from "../Pages/Sidebar";
import Navbar from "../Pages/Navbar";
import API from "../services/API";

const Coupons = () => {
  const vendor = JSON.parse(localStorage.getItem("vendor"));
  const [coupons, setCoupons] = useState([]);

  const [form, setForm] = useState({
    code: "",
    discount: "",
    minOrderAmount: "",
    expiryDate: "",
  });

  const loadCoupons = async () => {
    try {
      const res = await API.get(`/api/coupon/vendor/${vendor.id}`);
      setCoupons(res.data.coupons || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const createCoupon = async (e) => {
    e.preventDefault();

    try {
      await API.post("/api/coupon/create",
        {
          ...form,
          vendor: vendor.id,
        }
      );

      setForm({
        code: "",
        discount: "",
        minOrderAmount: "",
        expiryDate: "",
      });

      loadCoupons();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Navbar */}
        <Navbar />

        <div className="p-6 overflow-y-auto">

          <h1 className="text-3xl font-bold mb-6">
            🏷️ Coupons Management
          </h1>

          {/* Create Coupon Form */}
          <form onSubmit={createCoupon} className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Create New Coupon
            </h2>
            <div className="grid md:grid-cols-4 gap-4">

              <input type="text" placeholder="Coupon Code" className="border p-3 rounded-lg" value={form.code}
                onChange={(e) =>setForm({...form,code: e.target.value,})} required/>

              <input type="number" placeholder="Discount %" className="border p-3 rounded-lg" value={form.discount}
                onChange={(e) =>setForm({...form,discount: e.target.value,})}required/>

              <input type="number" placeholder="Minimum Order Amount" className="border p-3 rounded-lg" value={form.minOrderAmount}
                onChange={(e) =>setForm({...form,minOrderAmount:e.target.value,})}/>

              <input type="date" className="border p-3 rounded-lg" value={form.expiryDate}
                onChange={(e) => setForm({...form,expiryDate:e.target.value,})}required/>
            </div>

            <button type="submit" className="mt-5 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg">
              Create Coupon
            </button>
          </form>

          {/* Coupons Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">

            <div className="p-5 border-b">
              <h2 className="text-xl font-semibold">
                Available Coupons
              </h2>
            </div>

            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">
                    Code
                  </th>
                  <th className="p-4 text-left">
                    Discount
                  </th>
                  <th className="p-4 text-left">
                    Min Order
                  </th>
                  <th className="p-4 text-left">
                    Expiry Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {coupons.length > 0 ? (
                  coupons.map((coupon) => (
                    <tr key={coupon._id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-semibold text-cyan-600">
                        {coupon.code}
                      </td>

                      <td className="p-4">
                        {coupon.discount}%
                      </td>

                      <td className="p-4">
                        ₹{coupon.minOrderAmount}
                      </td>

                      <td className="p-4">
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-500">
                      No Coupons Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Coupons;