import React, { useState } from "react";
import Sidebar from "../Pages/Sidebar";
import Navbar from "../Pages/Navbar";
import API from "../services/API";
import { toast } from "react-toastify";
import { Package, Upload } from "lucide-react";

const AddProduct = () => {
  const vendor = JSON.parse(
    localStorage.getItem("vendor")
  );

  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState([]);

  const [previewImages, setPreviewImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    category: "",
    price: "",
    offerprice: "",
    stock: true,
  });

  const categories = [
    "Electronics",
    "Fashion",
    "Books",
    "Groceries",
    "Sports",
    "Home Appliances",
    "Toys & Games",
    "Beauty",
    "Furniture",
    "Mobile Accessories",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(
      e.target.files
    );

    setImages(files);

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviewImages(previews);
  };

const handleSubmit = async (e) => {

  e.preventDefault();

  if (
    !formData.name ||
    !formData.desc ||
    !formData.category ||
    !formData.price ||
    !formData.offerprice
  ) {

    return toast.error(
      "Please fill all fields"
    );
  }

  if (images.length === 0) {

    return toast.error(
      "Please upload at least one image"
    );
  }

  try {

    setLoading(true);

    const data = new FormData();

    data.append(
      "vendor",
      vendor?.id || vendor?._id
    );

    data.append(
      "name",
      formData.name
    );

    data.append(
      "desc",
      formData.desc
    );

    data.append(
      "category",
      formData.category
    );

    data.append(
      "price",
      formData.price
    );

    data.append(
      "offerprice",
      formData.offerprice
    );

    data.append(
      "stock",
      formData.stock
    );

    images.forEach((img) => {

      // IMPORTANT
      data.append(
        "image",
        img
      );

    });

    const res = await API.post(
      "/api/product/add",
      data,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    if (res.data.success) {

      toast.success(
        "Product Added Successfully"
      );

      setFormData({
        name: "",
        desc: "",
        category: "",
        price: "",
        offerprice: "",
        stock: true,
      });

      setImages([]);
      setPreviewImages([]);

    }

  } catch (error) {

    console.log(error);

    console.log(
      error?.response?.data
    );

    toast.error(
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      "Failed To Add Product"
    );

  } finally {

    setLoading(false);

  }
};
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="p-6 md:p-8">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            
            {/* Header */}
            <div className="border-b bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-6">
              <div className="flex items-center gap-3 text-white">
                <Package size={30} />
                <div>
                  <h1 className="text-2xl font-bold">
                    Add New Product
                  </h1>

                  <p className="text-cyan-100 text-sm mt-1">
                    Create and publish products to your store
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-8 space-y-8"
            >
              {/* Product Info */}
              <div className="grid md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter Product Name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="">
                      Select Category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Description */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Description
                </label>

                <textarea
                  rows="5"
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  placeholder="Write detailed product description..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
                />
              </div>

              {/* Price Section */}

              <div className="grid md:grid-cols-3 gap-6">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="₹ Price"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Offer Price
                  </label>

                  <input
                    type="number"
                    name="offerprice"
                    value={formData.offerprice}
                    onChange={handleChange}
                    placeholder="₹ Offer Price"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Status
                  </label>

                  <select
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock:
                          e.target.value ===
                          "true",
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="true">
                      In Stock
                    </option>

                    <option value="false">
                      Out Of Stock
                    </option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Images
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-cyan-500 transition">
                  <Upload
                    size={40}
                    className="mx-auto text-cyan-600"
                  />

                  <p className="text-gray-500 mt-3">
                    Upload Product Images
                  </p>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={
                      handleImageChange
                    }
                    className="mt-4"
                  />
                </div>
              </div>

              {/* Preview Images */}

              {previewImages.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">
                    Image Preview
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {previewImages.map(
                      (img, index) => (
                        <div
                          key={index}
                          className="border rounded-xl overflow-hidden shadow-sm"
                        >
                          <img
                            src={img}
                            alt="preview"
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Button */}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-200 cursor-pointer"
                >
                  {loading
                    ? "Adding Product..."
                    : "Add Product"}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;