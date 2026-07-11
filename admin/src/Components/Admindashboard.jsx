import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Search,
  Bell,
  Users,
  Store,
  Package,
  ClipboardList,
  Clock,
  IndianRupee,
  ChevronRight,
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Settings,
  Menu,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

/* ===========================================================
   API CONFIG — matches your actual mounted routes in app.js
   =========================================================== */

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) ||
  "https://multi-vendor-project-2fua.vercel.app/api";

const ENDPOINTS = {
  users: `${API_BASE}/user/getallusers`,
  vendors: `${API_BASE}/vendor/all`,
  products: `${API_BASE}/product/all`,
  orders: `${API_BASE}/vendor-order/vendor-orders`,
  vendorEarnings: (vendorId) => `${API_BASE}/analytics/earnings/${vendorId}`,
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

// Confirmed field names from VendorOrder / VendorAnalyticsController.
function getOrderStatus(order) {
  return String(order?.orderStatus || "pending").toLowerCase();
}
function getOrderAmount(order) {
  const v = Number(order?.totalAmount);
  return Number.isNaN(v) ? 0 : v;
}
function isRevenueEligible(order) {
  // Same rule your backend already uses in vendorDashboard / getVendorEarnings.
  return getOrderStatus(order) === "delivered" && String(order?.paymentStatus).toLowerCase() === "paid";
}

function formatINR(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ===========================================================
   DATA HOOK — every resource independent, no fallback/mock data.
   =========================================================== */

function useDashboardData() {
  const [resources, setResources] = useState({
    users: { status: "loading", error: null, count: null },
    vendors: { status: "loading", error: null, list: null },
    products: { status: "loading", error: null, count: null },
    orders: { status: "loading", error: null, list: null },
  });

  const load = useCallback(async () => {
    setResources({
      users: { status: "loading", error: null, count: null },
      vendors: { status: "loading", error: null, list: null },
      products: { status: "loading", error: null, count: null },
      orders: { status: "loading", error: null, list: null },
    });

    const [usersR, vendorsR, productsR, ordersR] = await Promise.allSettled([
      fetchJson(ENDPOINTS.users),
      fetchJson(ENDPOINTS.vendors),
      fetchJson(ENDPOINTS.products),
      fetchJson(ENDPOINTS.orders),
    ]);

    setResources({
      // { success, message, token, user: [...] } — key is "user" (singular).
      users:
        usersR.status === "fulfilled"
          ? { status: "success", error: null, count: toArray(usersR.value, "user", "users", "data").length }
          : { status: "error", error: usersR.reason?.message || "Failed to load users", count: null },
      // { success, message, vendors: [...] }
      vendors:
        vendorsR.status === "fulfilled"
          ? { status: "success", error: null, list: toArray(vendorsR.value, "vendors", "data") }
          : { status: "error", error: vendorsR.reason?.message || "Failed to load vendors", list: null },
      // { success, message, count, all: [...] } — key is "all".
      products:
        productsR.status === "fulfilled"
          ? { status: "success", error: null, count: toArray(productsR.value, "all", "products", "data").length }
          : { status: "error", error: productsR.reason?.message || "Failed to load products", count: null },
      // { success, orders: [...] }. Note: this route has no :vendorId param in
      // your Express router, so req.params.vendorId is always undefined, and
      // VendorOrder.find({vendor: undefined}) ends up matching every vendor's
      // orders — effectively an admin-wide order list. Handy here, but flagging
      // it since the route/param naming suggests it was meant to be vendor-scoped.
      orders:
        ordersR.status === "fulfilled"
          ? { status: "success", error: null, list: toArray(ordersR.value, "orders", "data") }
          : { status: "error", error: ordersR.reason?.message || "Failed to load orders", list: null },
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { resources, reload: load };
}

// Depends on vendors resolving first — fetches per-vendor earnings for the
// "Top vendors" leaderboard. Real network calls, no invented numbers.
function useVendorEarnings(vendorsResource) {
  const [state, setState] = useState({ status: "loading", error: null, data: null });

  useEffect(() => {
    if (vendorsResource.status !== "success") return;
    let cancelled = false;
    setState({ status: "loading", error: null, data: null });

    (async () => {
      try {
        const results = await Promise.all(
          vendorsResource.list.slice(0, 12).map(async (v) => {
            const vendorId = v._id || v.id;
            if (!vendorId) return { name: v.name || v.storeName || "Vendor", earnings: 0, error: "No vendor id" };
            try {
              const raw = await fetchJson(ENDPOINTS.vendorEarnings(vendorId));
              return {
                name: v.storeName || v.name || vendorId,
                earnings: Number(raw?.totalRevenue) || 0,
              };
            } catch (err) {
              return { name: v.storeName || v.name || vendorId, earnings: 0, error: err.message };
            }
          })
        );
        if (cancelled) return;
        const sorted = results.sort((a, b) => b.earnings - a.earnings).slice(0, 4);
        setState({ status: "success", error: null, data: sorted });
      } catch (err) {
        if (cancelled) return;
        setState({ status: "error", error: err.message || String(err), data: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [vendorsResource.status, vendorsResource.list]);

  return state;
}

/* ---------------------------------------------------------
   TOKENS
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

const statusStyle = {
  Delivered: { bg: "#E7F1EA", fg: "#2F6B49" },
  Pending: { bg: "#FBEFDD", fg: "#93641C" },
  Processing: { bg: "#E7ECF5", fg: "#3A4E86" },
  Shipped: { bg: "#EFE7F5", fg: "#6B3F91" },
  Cancelled: { bg: "#FBEAE7", fg: "#93342A" },
};

function toTitle(s) {
  if (!s) return "Pending";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
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

function StatCard({ label, icon: Icon, status, error, displayValue }) {
  const [hover, setHover] = useState(false);
  const isLoading = status === "loading";
  const isError = status === "error";

  return (
    <TicketCard
      style={{
        padding: "18px 20px",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hover ? "0 8px 20px rgba(23,28,43,0.08)" : "0 1px 2px rgba(23,28,43,0.04)",
        transition: "transform 160ms ease, box-shadow 160ms ease",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontFamily: "Inter, sans-serif",
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: "0.02em",
              color: "#6B7085",
              textTransform: "uppercase",
            }}
          >
            {label}
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontFamily: "Fraunces, serif",
              fontSize: 26,
              fontWeight: 600,
              color: isError ? "#C1503F" : "#171C2B",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {isLoading ? "…" : isError ? "—" : displayValue}
          </p>
        </div>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: "#171C2B0D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={17} color="#171C2B" strokeWidth={1.8} />
        </div>
      </div>
      {isError && <ErrorNote message={error} />}
      {!isError && !isLoading && (
        <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "#9AA0AF" }}>Live from backend</p>
      )}
    </TicketCard>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "#171C2B",
        color: "#F3F2EF",
        padding: "8px 12px",
        borderRadius: 8,
        fontFamily: "Inter, sans-serif",
        fontSize: 12.5,
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ opacity: 0.7, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700 }}>₹{payload[0].value}L revenue</div>
    </div>
  );
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Store, label: "Vendors" },
  { icon: ShoppingBag, label: "Products" },
  { icon: ClipboardList, label: "Orders" },
  { icon: Wallet, label: "Payouts" },
  { icon: Settings, label: "Settings" },
];

const toneDot = { good: "#3E8F63", warn: "#E7A83C", bad: "#C1503F" };
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AdminDashboard() {
  const [navOpen, setNavOpen] = useState(false);
  const { resources, reload } = useDashboardData();
  const { users, vendors, products, orders } = resources;
  const vendorEarnings = useVendorEarnings(vendors);

  const pendingCount = useMemo(() => {
    if (orders.status !== "success") return null;
    return orders.list.filter((o) => getOrderStatus(o) === "pending").length;
  }, [orders.status, orders.list]);

  const revenueTotal = useMemo(() => {
    if (orders.status !== "success") return null;
    return orders.list.filter(isRevenueEligible).reduce((sum, o) => sum + getOrderAmount(o), 0);
  }, [orders.status, orders.list]);

  // Derived client-side from the same order list — last 6 calendar months,
  // revenue-eligible orders only, grouped by createdAt month. No separate
  // "monthly trend" endpoint exists, so this is computed from real orders
  // rather than shown as a placeholder.
  const monthlyTrend = useMemo(() => {
    if (orders.status !== "success") return null;
    const now = new Date();
    const buckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTH_LABELS[d.getMonth()], total: 0 });
    }
    orders.list.filter(isRevenueEligible).forEach((o) => {
      const d = new Date(o.createdAt);
      if (Number.isNaN(d.getTime())) return;
      const bucket = buckets.find((b) => b.year === d.getFullYear() && b.month === d.getMonth());
      if (bucket) bucket.total += getOrderAmount(o);
    });
    return buckets.map((b) => ({ month: b.label, revenue: Number((b.total / 100000).toFixed(2)) }));
  }, [orders.status, orders.list]);

  // Recent activity derived from the most recently created real orders —
  // no audit-log endpoint exists, so this reflects order events only.
  const recentActivity = useMemo(() => {
    if (orders.status !== "success") return null;
    return [...orders.list]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map((o) => {
        const status = getOrderStatus(o);
        const tone = status === "delivered" ? "good" : status === "cancelled" ? "bad" : "warn";
        const idTail = o._id ? String(o._id).slice(-4) : "";
        const buyer = o.user?.name ? ` by ${o.user.name}` : "";
        return {
          tone,
          text: `Order #${idTail} ${status}${buyer} — ${formatINR(getOrderAmount(o))}`,
          time: timeAgo(o.createdAt),
        };
      });
  }, [orders.status, orders.list]);

  const orderRows = orders.status === "success" ? [...orders.list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6) : [];
  const totalOrders = orders.status === "success" ? orders.list.length : null;

  const anyLoading = [users, vendors, products, orders].some((r) => r.status === "loading");

  return (
    <div style={{ display: "flex", minHeight: 640, background: "#F3F2EF", fontFamily: "Inter, sans-serif", color: "#171C2B" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: navOpen ? 208 : 64,
          background: "#171C2B",
          color: "#D9DCE6",
          flexShrink: 0,
          transition: "width 180ms ease",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            height: 60,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 18px",
            borderBottom: "1px solid #2A3145",
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "#E7A83C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 14, color: "#171C2B" }}>B</span>
          </div>
          {navOpen && (
            <span style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 16, color: "#F3F2EF" }}>
              Bazaarly
            </span>
          )}
        </div>
        <nav style={{ padding: "14px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: 600,
                whiteSpace: "nowrap",
                cursor: "pointer",
                color: active ? "#171C2B" : "#B6BACB",
                background: active ? "#E7A83C" : "transparent",
              }}
            >
              <Icon size={16} strokeWidth={2} />
              {navOpen && label}
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* TOP BAR */}
        <header
          style={{
            height: 60,
            background: "#FFFFFF",
            borderBottom: "1px solid #E4E0D4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 22px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => setNavOpen((v) => !v)}
              style={{ border: "none", background: "transparent", cursor: "pointer", color: "#171C2B", display: "flex", padding: 4 }}
              aria-label="Toggle navigation"
            >
              <Menu size={19} />
            </button>
            <h1 style={{ margin: 0, fontFamily: "Fraunces, serif", fontSize: 19, fontWeight: 600, color: "#171C2B" }}>
              Marketplace overview
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#F3F2EF",
                border: "1px solid #E4E0D4",
                borderRadius: 8,
                padding: "7px 12px",
                width: 220,
              }}
            >
              <Search size={15} color="#8B90A0" />
              <span style={{ fontSize: 13, color: "#8B90A0" }}>Search anything…</span>
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
                background: "#F3F2EF",
                border: "1px solid #E4E0D4",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: anyLoading ? "default" : "pointer",
                opacity: anyLoading ? 0.6 : 1,
              }}
            >
              <RefreshCw size={13} className={anyLoading ? "spin" : ""} />
              Refresh
            </button>
            <button
              style={{ position: "relative", border: "none", background: "transparent", cursor: "pointer", color: "#171C2B", display: "flex" }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#C1503F",
                  border: "1.5px solid #FFFFFF",
                }}
              />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#171C2B",
                  color: "#E7A83C",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Fraunces, serif",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                A
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>Admin</span>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main style={{ padding: 22, overflowY: "auto", flex: 1 }}>
          {/* STAT CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <StatCard label="Total Users" icon={Users} status={users.status} error={users.error} displayValue={users.count?.toLocaleString()} />
            <StatCard
              label="Total Vendors"
              icon={Store}
              status={vendors.status}
              error={vendors.error}
              displayValue={vendors.list?.length?.toLocaleString()}
            />
            <StatCard label="Products" icon={Package} status={products.status} error={products.error} displayValue={products.count?.toLocaleString()} />
            <StatCard
              label="Total Orders"
              icon={ClipboardList}
              status={orders.status}
              error={orders.error}
              displayValue={orders.list?.length?.toLocaleString()}
            />
            <StatCard
              label="Pending Orders"
              icon={Clock}
              status={orders.status}
              error={orders.error}
              displayValue={pendingCount?.toLocaleString()}
            />
            <StatCard
              label="Revenue"
              icon={IndianRupee}
              status={orders.status}
              error={orders.error}
              displayValue={revenueTotal !== null ? formatINR(revenueTotal) : null}
            />
          </div>

          {/* CHART + ACTIVITY */}
          <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16, marginBottom: 16 }}>
            <TicketCard style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                <h2 style={{ margin: 0, fontFamily: "Fraunces, serif", fontSize: 16.5, fontWeight: 600 }}>Monthly revenue</h2>
                <span style={{ fontSize: 12, color: "#9AA0AF" }}>Last 6 months, in ₹ Lakh (delivered + paid orders)</span>
              </div>

              {orders.status === "error" && <ErrorNote message={orders.error} />}
              {orders.status === "loading" && <p style={{ fontSize: 13, color: "#9AA0AF" }}>Loading revenue trend…</p>}

              {orders.status === "success" && (
                <div style={{ height: 230 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E7A83C" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#E7A83C" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#EDEAE0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8B90A0" }} axisLine={{ stroke: "#E4E0D4" }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#8B90A0" }} axisLine={false} tickLine={false} width={34} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="revenue" stroke="#E7A83C" strokeWidth={2.5} fill="url(#revFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </TicketCard>

            <TicketCard style={{ padding: 20 }}>
              <h2 style={{ margin: "0 0 12px", fontFamily: "Fraunces, serif", fontSize: 16.5, fontWeight: 600 }}>Recent activity</h2>
              <p style={{ margin: "0 0 10px", fontSize: 11, color: "#9AA0AF" }}>Derived from recent orders (no audit-log endpoint yet)</p>

              {orders.status === "error" && <ErrorNote message={orders.error} />}
              {orders.status === "loading" && <p style={{ fontSize: 13, color: "#9AA0AF" }}>Loading activity…</p>}
              {orders.status === "success" && recentActivity.length === 0 && <EmptyNote message="No recent orders." />}

              {orders.status === "success" && recentActivity.length > 0 && (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {recentActivity.map((a, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        padding: "9px 0",
                        borderTop: i === 0 ? "none" : "1px solid #EFECE2",
                      }}
                    >
                      <span
                        style={{
                          marginTop: 5,
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: toneDot[a.tone],
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, color: "#171C2B", lineHeight: 1.4 }}>{a.text}</p>
                        <span style={{ fontSize: 11.5, color: "#9AA0AF" }}>{a.time}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TicketCard>
          </div>

          {/* ORDERS + VENDORS */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
            <TicketCard style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontFamily: "Fraunces, serif", fontSize: 16.5, fontWeight: 600 }}>Latest orders</h2>
                <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12.5, fontWeight: 600, color: "#E7A83C", cursor: "pointer" }}>
                  View all ({totalOrders ?? "—"}) <ChevronRight size={14} />
                </span>
              </div>

              {orders.status === "error" && <ErrorNote message={orders.error} />}
              {orders.status === "loading" && <p style={{ fontSize: 13, color: "#9AA0AF" }}>Loading orders…</p>}
              {orders.status === "success" && orderRows.length === 0 && <EmptyNote message="No orders returned by the backend." />}

              {orders.status === "success" && orderRows.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Order", "Customer", "Status", ""].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            fontSize: 11.5,
                            fontWeight: 700,
                            letterSpacing: "0.03em",
                            textTransform: "uppercase",
                            color: "#9AA0AF",
                            padding: "0 0 8px",
                            borderBottom: "1px solid #EFECE2",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orderRows.map((o) => {
                      const id = o._id ? `#${String(o._id).slice(-4)}` : "#----";
                      const statusLabel = toTitle(getOrderStatus(o));
                      const style = statusStyle[statusLabel] || statusStyle.Pending;
                      return (
                        <tr key={o._id}>
                          <td style={{ padding: "11px 0", fontSize: 13.5, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{id}</td>
                          <td style={{ padding: "11px 0", fontSize: 12.5, color: "#6B7085" }}>{o.user?.name || "—"}</td>
                          <td style={{ padding: "11px 0" }}>
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
                          <td style={{ padding: "11px 0", textAlign: "right" }}>
                            <ChevronRight size={14} color="#C7C2B4" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </TicketCard>

            <TicketCard style={{ padding: 20 }}>
              <h2 style={{ margin: "0 0 14px", fontFamily: "Fraunces, serif", fontSize: 16.5, fontWeight: 600 }}>Top vendors</h2>
              <p style={{ margin: "0 0 10px", fontSize: 11, color: "#9AA0AF" }}>Ranked by delivered + paid revenue</p>

              {vendors.status === "error" && <ErrorNote message={vendors.error} />}
              {vendors.status === "success" && vendorEarnings.status === "error" && <ErrorNote message={vendorEarnings.error} />}
              {(vendors.status === "loading" || (vendors.status === "success" && vendorEarnings.status === "loading")) && (
                <p style={{ fontSize: 13, color: "#9AA0AF" }}>Loading vendors…</p>
              )}
              {vendors.status === "success" && vendorEarnings.status === "success" && vendorEarnings.data.length === 0 && (
                <EmptyNote message="No vendors returned by the backend." />
              )}

              {vendors.status === "success" && vendorEarnings.status === "success" && vendorEarnings.data.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  {(() => {
                    const max = vendorEarnings.data[0]?.earnings || 1;
                    return vendorEarnings.data.map((v, i) => {
                      const share = Math.max(4, Math.round((v.earnings / max) * 100));
                      return (
                        <div key={v.name + i}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
                              <span
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: 5,
                                  background: i === 0 ? "#E7A83C" : "#F3F2EF",
                                  color: i === 0 ? "#171C2B" : "#8B90A0",
                                  fontSize: 10.5,
                                  fontWeight: 800,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {i + 1}
                              </span>
                              {v.name}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatINR(v.earnings)}</span>
                          </div>
                          <div style={{ height: 5, borderRadius: 3, background: "#EFECE2", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${share}%`,
                                height: "100%",
                                borderRadius: 3,
                                background: i === 0 ? "#E7A83C" : "#171C2B",
                                opacity: i === 0 ? 1 : 0.55,
                              }}
                            />
                          </div>
                          {v.error && <p style={{ margin: "3px 0 0", fontSize: 10.5, color: "#C1503F" }}>{v.error}</p>}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </TicketCard>
          </div>
        </main>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}