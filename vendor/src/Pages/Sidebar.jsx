import { ArchiveBoxIcon, ArrowRightOnRectangleIcon, ClipboardDocumentListIcon, CurrencyRupeeIcon, HomeIcon, PlusCircleIcon, ShoppingCartIcon} from "@heroicons/react/20/solid";
import { ChartBarIcon, TicketIcon } from "lucide-react";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const vendor = JSON.parse(localStorage.getItem("vendor"));
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-gray-900 text-white p-6 hidden md:flex flex-col">
      {/* Logo */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-cyan-400 text-center">
          {vendor?.storeName || "Vendor Panel"}
        </h2>
        <p className="text-sm text-gray-400 mt-2 text-center">
          Vendor Dashboard
        </p>
      </div>
      {/* Menu */}
      <div className="flex-1 space-y-3">
        <div onClick={() => navigate("/dash")} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition
          ${isActive("/dash")? "bg-cyan-800 text-cyan-400" : "text-gray-300 hover:bg-gray-800 hover:text-cyan-400"}`}>
          <HomeIcon className="w-5 h-5" />
          Dashboard
        </div>

        <div onClick={() => navigate("/dash/add-product")} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition
          ${isActive("/dash/add-product") ? "bg-cyan-800 text-cyan-400" : "text-gray-300 hover:bg-gray-800 hover:text-cyan-400"}`}>
          <PlusCircleIcon className="w-5 h-5" />
          Add Product
        </div>

        <div onClick={() => navigate("/dash/orders")} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition
          ${isActive("/dash/orders") ? "bg-cyan-800 text-cyan-400" : "text-gray-300 hover:bg-gray-800 hover:text-cyan-400"}`}>
          <ShoppingCartIcon className="w-5 h-5" />
          Orders
        </div>

        <div onClick={() => navigate("/dash/product-list")} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition
          ${isActive("/dash/product-list") ? "bg-cyan-800 text-cyan-400" : "text-gray-300 hover:bg-gray-800 hover:text-cyan-400"}`}>
          <ClipboardDocumentListIcon className="w-5 h-5" />
          Product List
        </div>

        <div onClick={() => navigate("/dash/earnings")} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition
          ${isActive("/dash/earnings") ? "bg-cyan-800 text-cyan-400" : "text-gray-300 hover:bg-gray-800 hover:text-cyan-400"}`}>
          <CurrencyRupeeIcon className="w-5 h-5" />
          Earnings
        </div>

        <div onClick={() => navigate("/dash/analytics")} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition
          ${isActive("/dash/analytics") ? "bg-cyan-800 text-cyan-400" : "text-gray-300 hover:bg-gray-800 hover:text-cyan-400"}`}>
          <ChartBarIcon className="w-5 h-5" />
          Analytics
        </div>

        <div onClick={() => navigate("/dash/coupons")} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition
          ${isActive("/dash/coupons") ? "bg-cyan-800 text-cyan-400" : "text-gray-300 hover:bg-gray-800 hover:text-cyan-400"}`}>
          <TicketIcon className="w-5 h-5" />
          Coupons
        </div>
      </div>

    </div>
  );
};

export default Sidebar;