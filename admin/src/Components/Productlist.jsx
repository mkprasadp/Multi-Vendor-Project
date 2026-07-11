import React, { useEffect, useState } from "react";
import axios from "axios";

const Productlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/product/all");
      if (data.success) {
        setProducts(data.all);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">
            Product Management
          </h1>

          <span className="rounded bg-blue-600 px-4 py-2 text-white">
            Total Products : {products.length}
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-lg font-semibold">
            Loading Products...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Image</th>
                  <th className="px-5 py-3 text-left">Product</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Price</th>
                  <th className="px-5 py-3 text-left">Stock</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product, index) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="px-5 py-4">{index + 1}</td>

                    <td className="px-5 py-4">
                      <img src={product.image} alt={product.name} className="h-16 w-16 rounded-lg border object-cover"/>
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {product.name}
                    </td>

                    <td className="px-5 py-4">
                      {product.category}
                    </td>

                    <td className="px-5 py-4 font-semibold text-green-600">
                      ₹{product.price}
                    </td>
                    
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-sm font-medium ${product.stock? "bg-green-100 text-green-700": "bg-red-100 text-red-700"}`}>
                        {product.stock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-3">
                        <button className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600">
                          Edit
                        </button>

                        <button className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {products.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      No Products Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Productlist;