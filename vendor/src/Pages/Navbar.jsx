import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaCog, FaStore, FaTimes} from "react-icons/fa";
import { toast } from "react-toastify";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const vendor = JSON.parse(localStorage.getItem("vendor"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("vendor");
    localStorage.removeItem("token");
    navigate("/");
    toast.success("Logout Successfully");
  };

  const firstLetter = vendor?.name?.charAt(0).toUpperCase() || "V";

  return (
    <nav className="h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg flex items-center justify-between px-8">
      {/* Left */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaStore />
          Vendor Dashboard
        </h1>
      </div>

      {/* Right */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-3 py-2 rounded-full hover:bg-white/30 transition-all duration-300 cursor-pointer"
        >
          {/* Avatar */}
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-lg shadow-md">
              {firstLetter}
            </div>

            {/* Online Status */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
          </div>

          <div className="text-left hidden md:block">
            <p className="text-white font-semibold">
              {vendor?.name}
            </p>
            <p className="text-xs text-gray-200">
              Vendor Account
            </p>
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 mt-4 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden border z-50">

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-5 text-white relative">

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 text-white hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
              >
                <FaTimes />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white text-indigo-600 flex items-center justify-center text-xl font-bold">
                  {firstLetter}
                </div>

                <div>
                  <h3 className="font-bold text-lg">
                    {vendor?.name}
                  </h3>
                  <p className="text-sm opacity-90">
                    {vendor?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="py-2">
              <button
                onClick={() => {
                  navigate("/vendor/profile");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-100 transition cursor-pointer"
              >
                <FaUser className="text-indigo-500" />
                Manage Profile
              </button>

              <button
                onClick={() => {
                  navigate("/vendor/settings");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-100 transition cursor-pointer"
              >
                <FaCog className="text-blue-500" />
                Settings
              </button>

              <hr />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-red-500 transition cursor-pointer"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;