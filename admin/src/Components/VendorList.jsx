import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Store,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  X,
} from "lucide-react";

/* ===========================================================
   API CONFIG — same source of truth as AdminDashboard
   =========================================================== */

const API_BASE = "https://multi-vendor-project-2fua.vercel.app/api";

const ENDPOINTS = {
  vendors: `${API_BASE}/vendor/all`,
  vendorEarnings: (vendorId) => `${API_BASE}/analytics/earnings/${vendorId}`,
  // Toggle route not confirmed in your router yet — wired up defensively so
  // the UI works the moment it exists; until then the button will surface
  // whatever error the backend returns instead of pretending to succeed.
  vendorStatus: (vendorId) => `${API_BASE}/vendor/${vendorId}/status`,
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
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function initials(name) {
  if (!name) return "V";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/* ===========================================================
   DATA HOOKS
   =========================================================== */

function useVendors() {
  const [state, setState] = useState({ status: "loading", error: null, list: null });

  const load = useCallback(async () => {
    setState({ status: "loading", error: null, list: null });
    try {
      const raw = await fetchJson(ENDPOINTS.vendors);
      setState({ status: "success", error: null, list: toArray(raw, "vendors", "data") });
    } catch (err) {
      setState({ status: "error", error: err.message || "Failed to load vendors", list: null });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}

// Per-vendor revenue, fetched lazily once the vendor list resolves. Kept
// separate from the vendor list request itself since it's a fan-out of N
// calls and shouldn't block first paint of the table.
function useVendorEarningsMap(vendorsResource) {
  const [state, setState] = useState({ status: "idle", error: null, map: {} });

  useEffect(() => {
    if (vendorsResource.status !== "success") return;
    let cancelled = false;
    setState({ status: "loading", error: null, map: {} });

    (async () => {
      const entries = await Promise.all(
        vendorsResource.list.map(async (v) => {
          const id = v._id || v.id;
          if (!id) return [id, { status: "error", error: "No vendor id" }];
          try {
            const raw = await fetchJson(ENDPOINTS.vendorEarnings(id));
            return [id, { status: "success", total: Number(raw?.totalRevenue) || 0 }];
          } catch (err) {
            return [id, { status: "error", error: err.message }];
          }
        })
      );
      if (cancelled) return;
      setState({ status: "success", error: null, map: Object.fromEntries(entries) });
    })();

    return () => {
      cancelled = true;
    };
  }, [vendorsResource.status, vendorsResource.list]);

  return state;
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

function StatusPill({ active }) {
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
        background: active ? "#E7F1EA" : "#FBEAE7",
        color: active ? "#2F6B49" : "#93342A",
      }}
    >
      {active ? <ShieldCheck size={12} /> : <ShieldOff size={12} />}
      {active ? "Active" : "Suspended"}
    </span>
  );
}

/* ===========================================================
   VENDOR DETAIL DRAWER
   =========================================================== */
function VendorDrawer({ vendor, earnings, onClose, onToggleStatus, toggling }) {
  if (!vendor) return null;
  const id = vendor._id || vendor.id;
  const name = vendor.storeName || vendor.name || "Vendor";
  const isActive = vendor.isActive !== false && vendor.status !== "suspended";

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
            <div
              style={{
                width: 44,
                height: 44,
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
            <div>
              <p style={{ margin: 0, fontFamily: "Fraunces, serif", fontSize: 17, fontWeight: 600, color: "#171C2B" }}>
                {name}
              </p>
              <div style={{ marginTop: 4 }}>
                <StatusPill active={isActive} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "#8B90A0", padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#171C2B" }}>
            <Mail size={14} color="#8B90A0" />
            {vendor.email || "—"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#171C2B" }}>
            <Phone size={14} color="#8B90A0" />
            {vendor.phone || vendor.contact || "—"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#171C2B" }}>
            <MapPin size={14} color="#8B90A0" />
            {vendor.address || vendor.location || "—"}
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
            Delivered + paid revenue
          </p>
          <p style={{ margin: "6px 0 0", fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 600, color: "#171C2B" }}>
            {earnings?.status === "success" ? formatINR(earnings.total) : earnings?.status === "error" ? "—" : "…"}
          </p>
          {earnings?.status === "error" && <ErrorNote message={earnings.error} />}
        </div>

        <button
          onClick={() => onToggleStatus(id, isActive)}
          disabled={toggling}
          style={{
            marginTop: 20,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 700,
            padding: "10px 14px",
            borderRadius: 8,
            border: isActive ? "1px solid #F1CFC7" : "1px solid #CFE4D6",
            background: isActive ? "#FBEAE7" : "#E7F1EA",
            color: isActive ? "#93342A" : "#2F6B49",
            cursor: toggling ? "default" : "pointer",
            opacity: toggling ? 0.6 : 1,
          }}
        >
          {isActive ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
          {toggling ? "Updating…" : isActive ? "Suspend vendor" : "Reactivate vendor"}
        </button>
      </div>
    </div>
  );
}

/* ===========================================================
   MAIN
   =========================================================== */
export default function VendorList() {
  const { status, error, list, reload } = useVendors();
  const earningsMap = useVendorEarningsMap({ status, list });
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [toggleErr, setToggleErr] = useState(null);

  const filtered = useMemo(() => {
    if (status !== "success") return [];
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter((v) => {
      const name = (v.storeName || v.name || "").toLowerCase();
      const email = (v.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [status, list, query]);

  const selectedVendor = useMemo(
    () => (status === "success" ? list.find((v) => (v._id || v.id) === selectedId) : null),
    [status, list, selectedId]
  );

  const handleToggleStatus = useCallback(
    async (vendorId, currentlyActive) => {
      setToggling(true);
      setToggleErr(null);
      try {
        await fetchJson(ENDPOINTS.vendorStatus(vendorId), {
          method: "PATCH",
          body: JSON.stringify({ isActive: !currentlyActive }),
        });
        await reload();
      } catch (err) {
        setToggleErr(err.message || "Failed to update vendor status");
      } finally {
        setToggling(false);
      }
    },
    [reload]
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
          <h1 style={{ margin: 0, fontFamily: "Fraunces, serif", fontSize: 21, fontWeight: 600 }}>Vendors</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#9AA0AF" }}>
            {status === "success" ? `${list.length} vendor${list.length === 1 ? "" : "s"} on the marketplace` : "Live from backend"}
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
              placeholder="Search vendors…"
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

      {toggleErr && (
        <div style={{ marginBottom: 12 }}>
          <ErrorNote message={toggleErr} />
        </div>
      )}

      {/* TABLE */}
      <TicketCard style={{ padding: 20 }}>
        {status === "error" && <ErrorNote message={error} />}
        {status === "loading" && <p style={{ fontSize: 13, color: "#9AA0AF" }}>Loading vendors…</p>}
        {status === "success" && list.length === 0 && <EmptyNote message="No vendors returned by the backend." />}
        {status === "success" && list.length > 0 && filtered.length === 0 && (
          <EmptyNote message={`No vendors match “${query}”.`} />
        )}

        {status === "success" && filtered.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Vendor", "Contact", "Status", "Revenue", ""].map((h) => (
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
              {filtered.map((v) => {
                const id = v._id || v.id;
                const name = v.storeName || v.name || "Vendor";
                const isActive = v.isActive !== false && v.status !== "suspended";
                const earning = earningsMap.map?.[id];
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
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 10px 12px 0", fontSize: 12.5, color: "#6B7085", borderBottom: "1px solid #F5F3EC" }}>
                      {v.email || "—"}
                    </td>
                    <td style={{ padding: "12px 10px 12px 0", borderBottom: "1px solid #F5F3EC" }}>
                      <StatusPill active={isActive} />
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
                      {earningsMap.status === "loading" ? "…" : earning?.status === "success" ? formatINR(earning.total) : "—"}
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

      <VendorDrawer
        vendor={selectedVendor}
        earnings={selectedVendor ? earningsMap.map?.[selectedVendor._id || selectedVendor.id] : null}
        onClose={() => setSelectedId(null)}
        onToggleStatus={handleToggleStatus}
        toggling={toggling}
      />

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}