import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, RefreshCw, AlertTriangle, ChevronRight } from "lucide-react";

/* ===========================================================
   API CONFIG — mirrors AdminDashboard.js so this can be dropped
   in as a standalone route/page component.
   =========================================================== */

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://multi-vendor-project-2fua.vercel.app/api");

const ENDPOINTS = {
  orders: `${API_BASE}/order/my-orders`,
};

function authHeaders() {
  const token =
    (typeof window !== "undefined" && window.localStorage.getItem("adminToken")) || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { ...authHeaders() } });
  if (!res.ok) {
    let bodyMsg = "";
    try {
      const body = await res.json();
      bodyMsg = body?.message || body?.error || "";
    } catch {
      /* not json */
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
  const v = Number(n) || 0;
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v.toLocaleString("en-IN")}`;
}

function getOrderStatus(order) {
  return String(order?.orderStatus || "pending").toLowerCase();
}
function getOrderAmount(order) {
  const v = Number(order?.totalAmount);
  return Number.isNaN(v) ? 0 : v;
}
function toTitle(s) {
  if (!s) return "Pending";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const statusStyle = {
  Delivered: { bg: "#E7F1EA", fg: "#2F6B49" },
  Pending: { bg: "#FBEFDD", fg: "#93641C" },
  Processing: { bg: "#E7ECF5", fg: "#3A4E86" },
  Shipped: { bg: "#EFE7F5", fg: "#6B3F91" },
  Cancelled: { bg: "#FBEAE7", fg: "#93342A" },
};

const STATUS_FILTERS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

/* ---------------------------------------------------------
   DATA HOOK
----------------------------------------------------------- */

function useOrders() {
  const [state, setState] = useState({ status: "loading", error: null, list: null });

  const load = useCallback(async () => {
    setState({ status: "loading", error: null, list: null });
    try {
      // { success, orders: [...] } — this route has no :vendorId param wired
      // up server-side, so it effectively returns every vendor's orders.
      const raw = await fetchJson(ENDPOINTS.orders);
      setState({ status: "success", error: null, list: toArray(raw, "orders", "data") });
    } catch (err) {
      setState({ status: "error", error: err.message || "Failed to load orders", list: null });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}

/* ---------------------------------------------------------
   UI PIECES (same tokens as AdminDashboard.js)
----------------------------------------------------------- */

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

/* ---------------------------------------------------------
   MAIN COMPONENT
----------------------------------------------------------- */

export default function OrderList() {
  const { status, error, list, reload } = useOrders();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    if (status !== "success") return [];
    const q = query.trim().toLowerCase();
    return list
      .filter((o) => statusFilter === "all" || getOrderStatus(o) === statusFilter)
      .filter((o) => {
        if (!q) return true;
        const id = String(o._id || "").toLowerCase();
        const buyer = String(o.user?.name || "").toLowerCase();
        return id.includes(q) || buyer.includes(q);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [status, list, query, statusFilter]);

  return (
    <main style={{ padding: 22, flex: 1, fontFamily: "Inter, sans-serif", color: "#171C2B" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#FFFFFF",
              border: "1px solid #E4E0D4",
              borderRadius: 8,
              padding: "8px 12px",
              width: 220,
            }}
          >
            <Search size={15} color="#8B90A0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order id, customer…"
              style={{ border: "none", outline: "none", fontSize: 13, width: "100%", background: "transparent", color: "#171C2B" }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid " + (statusFilter === s ? "#171C2B" : "#E4E0D4"),
                  background: statusFilter === s ? "#171C2B" : "#FFFFFF",
                  color: statusFilter === s ? "#F3F2EF" : "#6B7085",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={reload}
          disabled={status === "loading"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            fontWeight: 600,
            color: "#171C2B",
            background: "#F3F2EF",
            border: "1px solid #E4E0D4",
            borderRadius: 8,
            padding: "7px 14px",
            cursor: status === "loading" ? "default" : "pointer",
            opacity: status === "loading" ? 0.6 : 1,
          }}
        >
          <RefreshCw size={13} className={status === "loading" ? "spin" : ""} />
          Refresh
        </button>
      </div>

      <TicketCard style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontFamily: "Fraunces, serif", fontSize: 17, fontWeight: 600 }}>
            Orders {status === "success" ? `(${filtered.length})` : ""}
          </h2>
        </div>

        {status === "error" && <ErrorNote message={error} />}
        {status === "loading" && <p style={{ fontSize: 13, color: "#9AA0AF" }}>Loading orders…</p>}
        {status === "success" && filtered.length === 0 && (
          <EmptyNote message={query || statusFilter !== "all" ? "No orders match your filters." : "No orders returned by the backend."} />
        )}

        {status === "success" && filtered.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Order", "Customer", "Payment", "Status", "Amount", "Placed", ""].map((h) => (
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
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const id = o._id ? `#${String(o._id).slice(-6)}` : "#------";
                  const statusLabel = toTitle(getOrderStatus(o));
                  const style = statusStyle[statusLabel] || statusStyle.Pending;
                  const placed = new Date(o.createdAt);
                  const placedLabel = Number.isNaN(placed.getTime())
                    ? "—"
                    : placed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                  return (
                    <tr key={o._id}>
                      <td style={{ padding: "11px 10px 11px 0", fontSize: 13.5, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{id}</td>
                      <td style={{ padding: "11px 10px 11px 0", fontSize: 12.5, color: "#6B7085" }}>{o.user?.name || "—"}</td>
                      <td style={{ padding: "11px 10px 11px 0", fontSize: 12.5, color: "#6B7085", textTransform: "capitalize" }}>
                        {o.paymentStatus || "—"}
                      </td>
                      <td style={{ padding: "11px 10px 11px 0" }}>
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: 999,
                            background: style.bg,
                            color: style.fg,
                          }}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td style={{ padding: "11px 10px 11px 0", fontSize: 13.5, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                        {formatINR(getOrderAmount(o))}
                      </td>
                      <td style={{ padding: "11px 10px 11px 0", fontSize: 12, color: "#9AA0AF", whiteSpace: "nowrap" }}>{placedLabel}</td>
                      <td style={{ padding: "11px 0", textAlign: "right" }}>
                        <ChevronRight size={14} color="#C7C2B4" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </TicketCard>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}