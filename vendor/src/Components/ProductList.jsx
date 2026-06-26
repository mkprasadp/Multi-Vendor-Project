import React, { useEffect, useState, useRef, useCallback } from "react";
import Sidebar from "../Pages/Sidebar";
import { toast } from "react-toastify";
import API from "../services/API";
import {
  Search, Package, IndianRupee, Edit, Trash2, LayoutGrid, List,
  ArrowUpDown, X, ShoppingBag, AlertCircle, ChevronDown, Save,
  ImagePlus, Tag, FileText, DollarSign, Layers
} from "lucide-react";
import Navbar from "../Pages/Navbar";

/* ─────────────────────────────────────────
   Skeleton loader card
───────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-44 bg-gray-100" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-100 rounded-full w-3/4" />
      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
      <div className="h-3 bg-gray-100 rounded-full w-1/3" />
      <div className="h-8 bg-gray-100 rounded-xl mt-4" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-8 bg-gray-100 rounded-lg" />
        <div className="h-8 bg-gray-100 rounded-lg" />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Stat card
───────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, valueClass = "text-gray-900", accent }) => (
  <div className={`bg-white border rounded-xl p-4 relative overflow-hidden ${accent ? "border-l-2 " + accent : "border-gray-100"}`}>
    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
      {icon} {label}
    </div>
    <p className={`text-3xl font-semibold leading-none ${valueClass}`}>{value}</p>
    <p className="text-xs text-gray-400 mt-1.5">{sub}</p>
  </div>
);

/* ─────────────────────────────────────────
   Field wrapper — defined OUTSIDE EditModal
   so it never remounts on re-render
───────────────────────────────────────── */
const Field = ({ label, icon, error, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
      {icon} {label}
    </label>
    {children}
    {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
  </div>
);

/* ─────────────────────────────────────────
   Delete confirm modal
───────────────────────────────────────── */
const DeleteModal = ({ product, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm border border-gray-100">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
        <AlertCircle size={22} className="text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 text-center mb-1">Delete product?</h3>
      <p className="text-sm text-gray-400 text-center mb-6 leading-relaxed">
        <span className="font-medium text-gray-600">{product.name}</span> will be permanently removed from your inventory.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onCancel} className="py-2.5 rounded-xl border cursor-pointer border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} className="py-2.5 rounded-xl bg-red-500 cursor-pointer text-sm font-medium text-white hover:bg-red-600 active:scale-95 transition-all">
          Delete
        </button>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Edit product modal
───────────────────────────────────────── */
const EditModal = ({ product, onSave, onCancel, saving }) => {
  const [form, setForm] = useState({
    name:        product.name        || "",
    description: product.description || "",
    price:       product.price       || "",
    offerprice:  product.offerprice  || "",
    stock:       product.stock       ?? true,
    image:       Array.isArray(product.image) ? product.image[0] : (product.image || ""),
  });
  const [errors, setErrors] = useState({});
  const firstInputRef = useRef(null);

  useEffect(() => {
    // Small timeout ensures the modal is painted before focusing
    const t = setTimeout(() => firstInputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  // Stable change handler — does NOT recreate on every render
  const handleChange = useCallback((e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    // Clear error for this field as the user types
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                                      e.name       = "Name is required";
    if (!form.price || Number(form.price) <= 0)                 e.price      = "Enter a valid price";
    if (!form.offerprice || Number(form.offerprice) <= 0)       e.offerprice = "Enter a valid offer price";
    if (Number(form.offerprice) > Number(form.price))           e.offerprice = "Offer price can't exceed original price";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, price: Number(form.price), offerprice: Number(form.offerprice) });
  };

  const discount = form.price && form.offerprice
    ? Math.round(((Number(form.price) - Number(form.offerprice)) / Number(form.price)) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-gray-100 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Edit product</h2>
            <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{product.name}</p>
          </div>
          <button onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">

          {/* Image preview + URL */}
          <div className="flex gap-3 items-center">
            <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
              {form.image
                ? <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImagePlus size={20} /></div>
              }
            </div>
            <div className="flex-1">
              <Field label="Image URL" icon={<ImagePlus size={11} />} error={errors.image}>
                <input
                  type="text"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://…"
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-violet-300 focus:bg-white transition-colors"
                />
              </Field>
            </div>
          </div>

          {/* Name */}
          <Field label="Product name" icon={<Tag size={11} />} error={errors.name}>
            <input
              ref={firstInputRef}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Premium Wireless Headphones"
              className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:bg-white transition-colors ${errors.name ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-violet-300"}`}
            />
          </Field>

          {/* Description */}
          <Field label="Description" icon={<FileText size={11} />}>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Briefly describe this product…"
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-violet-300 focus:bg-white transition-colors resize-none"
            />
          </Field>

          {/* Price row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Original price (₹)" icon={<DollarSign size={11} />} error={errors.price}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">₹</span>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className={`w-full text-sm pl-7 pr-3 py-2.5 rounded-xl border bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:bg-white transition-colors ${errors.price ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-violet-300"}`}
                />
              </div>
            </Field>

            <Field label="Offer price (₹)" icon={<Layers size={11} />} error={errors.offerprice}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">₹</span>
                <input
                  type="number"
                  name="offerprice"
                  value={form.offerprice}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className={`w-full text-sm pl-7 pr-3 py-2.5 rounded-xl border bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:bg-white transition-colors ${errors.offerprice ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-violet-300"}`}
                />
              </div>
            </Field>
          </div>

          {/* Live discount badge */}
          {discount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="text-[11px] font-semibold text-emerald-600">{discount}% OFF</span>
              <span className="text-[11px] text-emerald-500">
                — customer saves ₹{(Number(form.price) - Number(form.offerprice)).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {/* Stock toggle */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">In stock</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Toggle availability for customers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="stock"
                checked={form.stock}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 rounded-full bg-gray-200 peer-checked:bg-emerald-500 transition-colors duration-200 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:w-[18px] after:h-[18px] after:bg-white after:rounded-full after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5" />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-sm font-medium text-white hover:bg-violet-700 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save size={13} /> Save changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Product card — grid view
───────────────────────────────────────── */
const ProductCardGrid = ({ product, onToggle, onDelete, onEdit }) => (
  <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 hover:-translate-y-0.5 transition-all duration-200">
    <div className={`relative h-44 overflow-hidden ${product.stock ? "bg-gray-50" : "bg-rose-50/50"}`}>
      <img src={Array.isArray(product.image) ? product.image[0] : product.image} alt={product.name}
        className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
        <button onClick={() => onEdit(product)} className="w-9 h-9 cursor-pointer rounded-full bg-white/90 flex items-center justify-center hover:bg-white hover:scale-110 transition-all">
          <Edit size={14} className="text-gray-700" />
        </button>
        <button onClick={() => onDelete(product)} className="w-9 h-9 cursor-pointer rounded-full bg-white/90 flex items-center justify-center hover:bg-red-50 hover:scale-110 transition-all">
          <Trash2 size={14} className="text-red-500" />
        </button>
      </div>
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 tracking-wide">SALE</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide ${product.stock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
          {product.stock ? "In stock" : "Out of stock"}
        </span>
      </div>
    </div>
    <div className="p-4">
      <h2 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 mb-1 min-h-[2.5rem]">{product.name}</h2>
      <p className="text-[11px] text-gray-400 mb-2.5">{product.category?.category_name}</p>
      <div className="flex items-center gap-1 mb-3">
        <span className="text-amber-400 text-xs leading-none">★★★★★</span>
        <span className="text-[11px] text-gray-400">4.5</span>
      </div>
      <div className="flex items-baseline gap-1.5 mb-4">
        <span className="text-base font-semibold text-gray-900">₹{Number(product.offerprice).toLocaleString("en-IN")}</span>
        <span className="text-xs text-gray-300 line-through">₹{Math.round(product.price).toLocaleString("en-IN")}</span>
        <span className="ml-auto text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
          {Math.round(((product.price - product.offerprice) / product.price) * 100)}% OFF
        </span>
      </div>
      <div className="flex items-center justify-between py-3 border-t border-gray-50 mb-3">
        <span className="text-[11px] text-gray-400 font-medium">Available</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={product.stock} onChange={() => onToggle(product._id, product.stock)} className="sr-only peer" />
          <div className="w-9 h-5 rounded-full bg-gray-200 peer-checked:bg-emerald-500 transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-4" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onEdit(product)} className="flex items-center justify-center cursor-pointer gap-1.5 text-xs font-medium py-2 rounded-lg border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 active:scale-95 transition-all duration-150">
          <Edit size={12} /> Edit
        </button>
        <button onClick={() => onDelete(product)} className="flex items-center justify-center cursor-pointer gap-1.5 text-xs font-medium py-2 rounded-lg border border-gray-200 text-gray-500 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 active:scale-95 transition-all duration-150">
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Product row — list view
───────────────────────────────────────── */
const ProductRowList = ({ product, onToggle, onDelete, onEdit }) => (
  <div className="group bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-4 hover:border-gray-200 hover:shadow-sm transition-all duration-150">
    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-50">
      <img src={Array.isArray(product.image) ? product.image[0] : product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{product.category?.category_name}</p>
    </div>
    <div className="hidden md:flex items-center gap-1 shrink-0">
      <span className="text-amber-400 text-xs">★★★★★</span>
      <span className="text-[11px] text-gray-400">4.5</span>
    </div>
    <div className="shrink-0 text-right hidden sm:block">
      <p className="text-sm font-semibold text-gray-900">₹{Number(product.offerprice).toLocaleString("en-IN")}</p>
      <p className="text-[11px] text-gray-300 line-through">₹{Math.round(product.price).toLocaleString("en-IN")}</p>
    </div>
    <span className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full ${product.stock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
      {product.stock ? "In stock" : "Out of stock"}
    </span>
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" checked={product.stock} onChange={() => onToggle(product._id, product.stock)} className="sr-only peer" />
      <div className="w-9 h-5 rounded-full bg-gray-200 peer-checked:bg-emerald-500 transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-4" />
    </label>
    <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={() => onEdit(product)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 active:scale-95 transition-all">
        <Edit size={13} />
      </button>
      <button onClick={() => onDelete(product)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 active:scale-95 transition-all">
        <Trash2 size={13} />
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const ProductList = () => {
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filter, setFilter]             = useState("all");
  const [sortBy, setSortBy]             = useState("default");
  const [viewMode, setViewMode]         = useState("grid");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sortOpen, setSortOpen]         = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving]             = useState(false);

  const vendor   = JSON.parse(localStorage.getItem("vendor"));
  const vendorId = vendor?.id;

  const fetchProducts = async () => {
    try {
      const res = await API.get(`/api/Product/vendor/${vendorId}`);
      if (res.data.success) setProducts(res.data.products);
    } catch {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const toggleStock = async (productId, currentStock) => {
    try {
      const res = await API.put(`/api/Product/update-stock/${productId}`, { stock: !currentStock });
      if (res.data.success) {
        setProducts((prev) => prev.map((p) => p._id === productId ? { ...p, stock: !currentStock } : p));
        toast.success(`Marked as ${!currentStock ? "in stock" : "out of stock"}`);
      }
    } catch {
      toast.error("Failed to update stock");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await API.delete(`/api/Product/delete/${deleteTarget._id}`);
      if (res.data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
        toast.success("Product deleted");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEdit = (product) => setEditingProduct(product);

  const handleSave = async (updatedFields) => {
    setSaving(true);
    try {
      const res = await API.put(`/api/Product/update/${editingProduct._id}`, updatedFields);
      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) => p._id === editingProduct._id ? { ...p, ...updatedFields } : p)
        );
        toast.success("Product updated");
        setEditingProduct(null);
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch {
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const handler = () => setSortOpen(false);
    if (sortOpen) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [sortOpen]);

  const totalValue = products.reduce((acc, p) => acc + Number(p.price || 0), 0);

  const sortOptions = [
    { key: "default",    label: "Default" },
    { key: "price-asc",  label: "Price: Low → High" },
    { key: "price-desc", label: "Price: High → Low" },
    { key: "name-asc",   label: "Name: A → Z" },
    { key: "name-desc",  label: "Name: Z → A" },
  ];

  const filteredProducts = products
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" || (filter === "in" && p.stock) || (filter === "out" && !p.stock);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc")  return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name-asc")   return a.name.localeCompare(b.name);
      if (sortBy === "name-desc")  return b.name.localeCompare(a.name);
      return 0;
    });

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="h-[65px] bg-white border-b border-gray-100" />
          <main className="flex-1 px-8 py-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white border border-gray-100 rounded-xl animate-pulse" />)}
              </div>
              <div className="h-11 bg-white border border-gray-100 rounded-xl animate-pulse" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 px-8 py-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-5">

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={<Package size={13} />} label="Total" value={products.length} sub="products listed" accent="border-l-violet-300" />
              <StatCard icon={<span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />} label="In stock" value={products.filter((p) => p.stock).length} sub="available" valueClass="text-emerald-600" accent="border-l-emerald-300" />
              <StatCard icon={<span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />} label="Out of stock" value={products.filter((p) => !p.stock).length} sub="unavailable" valueClass="text-red-500" accent="border-l-red-300" />
              <StatCard icon={<IndianRupee size={13} />} label="Inventory value" value={`₹${totalValue.toLocaleString("en-IN")}`} sub="total" valueClass="text-gray-900 text-2xl" accent="border-l-blue-300" />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="flex-1 flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-4 py-2.5 focus-within:border-gray-300 transition-colors">
                <Search size={14} className="text-gray-300 shrink-0" />
                <input type="text" placeholder="Search products by name…" value={search} onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-300 min-w-0" />
                {search && (
                  <>
                    <span className="shrink-0 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filteredProducts.length} found</span>
                    <button onClick={() => setSearch("")}><X size={13} className="text-gray-400 hover:text-gray-600" /></button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {[{ key: "all", label: "All" }, { key: "in", label: "In stock" }, { key: "out", label: "Out of stock" }].map(({ key, label }) => (
                  <button key={key} onClick={() => setFilter(key)}
                    className={`text-xs cursor-pointer px-3.5 py-2 rounded-full border transition-all duration-150 ${filter === key ? "border-violet-200 bg-violet-50 text-violet-700 font-medium" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="relative shrink-0">
                <button onClick={(e) => { e.stopPropagation(); setSortOpen((o) => !o); }}
                  className="flex items-center gap-2 text-xs px-3.5 cursor-pointer py-2 rounded-full border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-all">
                  <ArrowUpDown size={13} /> Sort
                  <ChevronDown size={11} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-100 py-1 z-30">
                    {sortOptions.map((opt) => (
                      <button key={opt.key} onClick={() => { setSortBy(opt.key); setSortOpen(false); }}
                        className={`w-full cursor-pointer text-left px-4 py-2.5 text-xs transition-colors ${sortBy === opt.key ? "text-violet-700 bg-violet-50 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0">
                <button onClick={() => setViewMode("grid")} className={`p-1.5 cursor-pointer rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}>
                  <LayoutGrid size={14} />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-1.5 cursor-pointer rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}>
                  <List size={14} />
                </button>
              </div>
            </div>

            {/* Section label */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Products</p>
              <p className="text-[11px] text-gray-400">{filteredProducts.length} of {products.length}</p>
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <ShoppingBag size={24} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">No products found</p>
                  <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
                </div>
                <button onClick={() => { setSearch(""); setFilter("all"); setSortBy("default"); }}
                  className="text-xs font-medium text-violet-600 hover:text-violet-800 underline underline-offset-2">
                  Clear all filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-10">
                {filteredProducts.map((product) => (
                  <ProductCardGrid key={product._id} product={product} onToggle={toggleStock} onDelete={setDeleteTarget} onEdit={handleEdit} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2 pb-10">
                {filteredProducts.map((product) => (
                  <ProductRowList key={product._id} product={product} onToggle={toggleStock} onDelete={setDeleteTarget} onEdit={handleEdit} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {deleteTarget && (
        <DeleteModal product={deleteTarget} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
      )}

      {editingProduct && (
        <EditModal
          product={editingProduct}
          onSave={handleSave}
          onCancel={() => setEditingProduct(null)}
          saving={saving}
        />
      )}
    </div>
  );
};

export default ProductList;