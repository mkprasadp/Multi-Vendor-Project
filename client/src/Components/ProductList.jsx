import { useEffect, useState } from "react";
import axios from "axios";
import {
  Heart,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import API from "../services/API";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const result = products.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProducts(result);
  }, [search, products]);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/product/all");

      if (data.success) {
        setProducts(data.all);
        setFilteredProducts(data.all);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white z-50 border-b">
        <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          
          <h1 className="text-2xl font-bold">
            Discover Products
          </h1>

          <div className="relative w-full md:w-96">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search products..."
              className="w-full border rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <button className="flex items-center gap-2 border px-4 py-2 rounded-xl hover:bg-gray-100">
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <p className="text-gray-500 mb-5">
          {filteredProducts.length} Products Found
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredProducts.map((product) => {
            const discount =
              product.price > product.offerprice
                ? Math.round(
                    ((product.price -
                      product.offerprice) /
                      product.price) *
                      100
                  )
                : 0;

            return (
              <div
                key={product._id}
                className="group bg-white rounded-2xl overflow-hidden border hover:shadow-xl transition duration-300"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
                  />

                  <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow">
                    <Heart
                      size={18}
                      className="text-gray-600"
                    />
                  </button>

                  {discount > 0 && (
                    <span className="absolute left-3 top-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h2 className="font-semibold text-gray-800 line-clamp-2">
                    {product.name}
                  </h2>

                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xl font-bold text-green-600">
                      ₹{product.offerprice}
                    </span>

                    {product.price >
                      product.offerprice && (
                      <span className="text-gray-400 line-through text-sm">
                        ₹{product.price}
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    {product.stock ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        In Stock
                      </span>
                      ) : (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <button disabled={!product.stock} className={`w-full mt-4 py-2 rounded-xl transition ${product.stock
                    ? "bg-black text-white hover:bg-gray-900 cursor-pointer" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
                    {product.stock ? "Add To Cart" : "Out of Stock"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}