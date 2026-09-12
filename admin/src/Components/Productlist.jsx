import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Package,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  X,
  Tag,
  Store,
  Boxes,
} from "lucide-react";

/* ===========================================================
   API CONFIG — same source of truth as AdminDashboard
   =========================================================== */

const API_BASE = "https://multi-vendor-project-2fua.vercel.app/api";

const ENDPOINTS = {
  products: `${API_BASE}/product/all`,
};

function authHeaders() {
  const token =
    (typeof window !== "undefined" && window.localStorage.getItem("adminToken")) || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    let bodyMsg = "";
    try {
      const body = await res.json();
      bodyMsg = body?.message || body?.error || "";
    } catch {
      /* response wasn't json */
    }
    throw new Error(`${res.status} ${res.statusText}${bodyMsg ? ` — ${bodyMsg}` : ""}`);
  }
  return res.json();
}

function toArray(payload, ...keys) {
  if (Array.isArray(payload)) return payload;
  for (const k of keys) {
    if (Array.isArray(payload?.[k])) return payload[k];
  }
  return [];
}

function formatINR(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  const v = Number(n);
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

// Field names guessed defensively — your product route confirmed the
// response wrapper key is "all", but individual field names weren't
// confirmed, so every accessor below falls back through common aliases
// instead of assuming one schema.
function getProductName(p) {
  return p?.name || p?.title || p?.productName || "Untitled product";
}
function getProductPrice(p) {
  const v = Number(p?.price ?? p?.sellingPrice ?? p?.mrp);
  return Number.isNaN(v) ? null : v;
}
function getProductStock(p) {
  const v = Number(p?.stock ?? p?.quantity ?? p?.countInStock);
  return Number.isNaN(v) ? null : v;
}
function getProductCategory(p) {
  return p?.category?.name || p?.category || p?.categoryName || "Uncategorised";
}
function getProductVendor(p) {
  return p?.vendor?.storeName || p?.vendor?.name || p?.vendorName || "—";
}
function getProductImage(p) {
  const img = p?.images?.[0] || p?.image || p?.thumbnail;
  if (!img) return null;
  return typeof img === "string" ? img : img?.url || null;
}

function initials(name) {
  if (!name) return "P";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/* ===========================================================
   DATA HOOK
   =========================================================== */

function useProducts() {
  const [state, setState] = useState({ status: "loading", error: null, list: null });

  const load = useCallback(async () => {
    setState({ status: "loading", error: null, list: null });
    try {
      const raw = await fetchJson(ENDPOINTS.products);
      setState({ status: "success", error: null, list: toArray(raw, "all", "products", "data") });
    } catch (err) {
      setState({ status: "error", error: err.message || "Failed to load products", list: null });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}

/* ---------------------------------------------------------
   TOKENS — mirrors AdminDashboard exactly, no reinvention
----------------------------------------------------------- */
const FONT_LINK_ID = "dashboard-fonts";
if (typeof document !== "undefined" && !document.getElementById(FONT_LINK_ID)) {
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap";
  document.head.appendChild(link);
}

function TicketCard({ children, style }) {
  return (
    <div
      style={{
        position: "relative",
        background: "#FFFFFF",
        border: "1px solid #E4E0D4",
        borderRadius: 10,
        boxShadow: "0 1px 2px rgba(23,28,43,0.04)",
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -7,
          right: 18,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#F3F2EF",
          border: "1px solid #E4E0D4",
        }}
      />
      {children}
    </div>
  );
}

function ErrorNote({ message }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 6,
        fontSize: 12,
        color: "#C1503F",
        background: "#FBEAE7",
        border: "1px solid #F1CFC7",
        borderRadius: 6,
        padding: "6px 8px",
        marginTop: 4,
      }}
    >
      <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ wordBreak: "break-word" }}>{message}</span>
    </div>
  );
}

function EmptyNote({ message }) {
  return <p style={{ margin: 0, fontSize: 12.5, color: "#9AA0AF" }}>{message}</p>;
}

function StockPill({ stock }) {
  if (stock === null) {
    return (
      <span style={{ fontSize: 12, color: "#9AA0AF" }}>—</span>
    );
  }
  const tone = stock === 0 ? { bg: "#FBEAE7", fg: "#93342A" } : stock < 10 ? { bg: "#FBEFDD", fg: "#93641C" } : { bg: "#E7F1EA", fg: "#2F6B49" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 999,
        background: tone.bg,
        color: tone.fg,
      }}
    >
      {stock === 0 ? "Out of stock" : `${stock} in stock`}
    </span>
  );
}

/* ===========================================================
   PRODUCT DETAIL DRAWER
   =========================================================== */
function ProductDrawer({ product, onClose }) {
  if (!product) return null;
  const name = getProductName(product);
  const image = getProductImage(product);
  const price = getProductPrice(product);
  const stock = getProductStock(product);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(23,28,43,0.28)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 340,
          maxWidth: "88%",
          height: "100%",
          background: "#FFFFFF",
          borderLeft: "1px solid #E4E0D4",
          padding: 22,
          overflowY: "auto",
          boxShadow: "-8px 0 24px rgba(23,28,43,0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {image ? (
              <img
                src={image}
                alt={name}
                style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: "#171C2B",
                  color: "#E7A83C",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Fraunces, serif",
                  fontWeight: 700,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {initials(name)}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: "#171C2B" }}>
                {name}
              </p>
              <div style={{ marginTop: 6 }}>
                <StockPill stock={stock} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "#8B90A0", padding: 4, flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#171C2B" }}>
            <Tag size={14} color="#8B90A0" />
            {getProductCategory(product)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#171C2B" }}>
            <Store size={14} color="#8B90A0" />
            {getProductVendor(product)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#171C2B" }}>
            <Boxes size={14} color="#8B90A0" />
            {stock === null ? "Stock not reported" : `${stock} units`}
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 8,
            background: "#F3F2EF",
            border: "1px solid #E4E0D4",
          }}
        >
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.02em", color: "#6B7085", textTransform: "uppercase" }}>
            Price
          </p>
          <p style={{ margin: "6px 0 0", fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 600, color: "#171C2B" }}>
            {price !== null ? formatINR(price) : "Not set"}
          </p>
        </div>

        {product.description && (
          <div style={{ marginTop: 18 }}>
            <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.02em", color: "#6B7085", textTransform: "uppercase" }}>
              Description
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#171C2B", lineHeight: 1.5 }}>{product.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===========================================================
   MAIN
   =========================================================== */
export default function ProductList() {
  const { status, error, list, reload } = useProducts();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    if (status !== "success") return [];
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter((p) => {
      const name = getProductName(p).toLowerCase();
      const category = getProductCategory(p).toLowerCase();
      return name.includes(q) || category.includes(q);
    });
  }, [status, list, query]);

  const selectedProduct = useMemo(
    () => (status === "success" ? list.find((p) => (p._id || p.id) === selectedId) : null),
    [status, list, selectedId]
  );

  const anyLoading = status === "loading";

  return (
    <div
      style={{
        position: "relative",
        minHeight: 640,
        background: "#F3F2EF",
        fontFamily: "Inter, sans-serif",
        color: "#171C2B",
        padding: 22,
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "Fraunces, serif", fontSize: 21, fontWeight: 600 }}>Products</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#9AA0AF" }}>
            {status === "success" ? `${list.length} product${list.length === 1 ? "" : "s"} across all vendors` : "Live from backend"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#FFFFFF",
              border: "1px solid #E4E0D4",
              borderRadius: 8,
              padding: "8px 12px",
              width: 240,
            }}
          >
            <Search size={15} color="#8B90A0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 13,
                color: "#171C2B",
                width: "100%",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>
          <button
            onClick={reload}
            disabled={anyLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              color: "#171C2B",
              background: "#FFFFFF",
              border: "1px solid #E4E0D4",
              borderRadius: 8,
              padding: "8px 12px",
              cursor: anyLoading ? "default" : "pointer",
              opacity: anyLoading ? 0.6 : 1,
            }}
          >
            <RefreshCw size={13} className={anyLoading ? "spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* TABLE */}
      <TicketCard style={{ padding: 20 }}>
        {status === "error" && <ErrorNote message={error} />}
        {status === "loading" && <p style={{ fontSize: 13, color: "#9AA0AF" }}>Loading products…</p>}
        {status === "success" && list.length === 0 && <EmptyNote message="No products returned by the backend." />}
        {status === "success" && list.length > 0 && filtered.length === 0 && (
          <EmptyNote message={`No products match “${query}”.`} />
        )}

        {status === "success" && filtered.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Product", "Category", "Vendor", "Price", "Stock", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      fontSize: 11.5,
                      fontWeight: 700,
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                      color: "#9AA0AF",
                      padding: "0 10px 8px 0",
                      borderBottom: "1px solid #EFECE2",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const id = p._id || p.id;
                const name = getProductName(p);
                const image = getProductImage(p);
                const price = getProductPrice(p);
                const stock = getProductStock(p);
                return (
                  <tr
                    key={id}
                    onClick={() => setSelectedId(id)}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF7")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 10px 12px 0", borderBottom: "1px solid #F5F3EC" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {image ? (
                          <img
                            src={image}
                            alt={name}
                            style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              background: "#171C2B0D",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "Fraunces, serif",
                              fontWeight: 700,
                              fontSize: 12,
                              color: "#171C2B",
                              flexShrink: 0,
                            }}
                          >
                            {initials(name)}
                          </div>
                        )}
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 10px 12px 0", fontSize: 12.5, color: "#6B7085", borderBottom: "1px solid #F5F3EC" }}>
                      {getProductCategory(p)}
                    </td>
                    <td style={{ padding: "12px 10px 12px 0", fontSize: 12.5, color: "#6B7085", borderBottom: "1px solid #F5F3EC" }}>
                      {getProductVendor(p)}
                    </td>
                    <td
                      style={{
                        padding: "12px 10px 12px 0",
                        fontSize: 13,
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                        borderBottom: "1px solid #F5F3EC",
                      }}
                    >
                      {price !== null ? formatINR(price) : "—"}
                    </td>
                    <td style={{ padding: "12px 10px 12px 0", borderBottom: "1px solid #F5F3EC" }}>
                      <StockPill stock={stock} />
                    </td>
                    <td style={{ padding: "12px 0", textAlign: "right", borderBottom: "1px solid #F5F3EC" }}>
                      <ChevronRight size={14} color="#C7C2B4" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </TicketCard>

      <ProductDrawer product={selectedProduct} onClose={() => setSelectedId(null)} />

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}