import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/API";

/* ── Icons ──────────────────────────────────────────────────────── */
const IconBag = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconMail = ({ className = "" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M22 7L12 14 2 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconLock = ({ className = "" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconEyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconShield = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M12 2l7 4v6c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Food emoji ticker ──────────────────────────────────────────── */
const FOODS = ["🍕","🍔","🌮","🍜","🍱","🥗","🍛","🥙","🧆","🍣"];

/* ── Floating Label Field ───────────────────────────────────────── */
const FloatField = ({ id, label, type, value, onChange, required, right, icon }) => {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  return (
    <div className={`relative flex items-center gap-3 px-4 h-[60px] rounded-2xl border-[1.5px] bg-gray-50 transition-all duration-200 cursor-text
      ${focused ? "border-orange-500 bg-white shadow-[0_0_0_4px_rgba(249,115,22,0.1)]" : "border-gray-200 hover:border-gray-300"}`}
      onClick={() => document.getElementById(id).focus()}>
      <span className={`flex-shrink-0 transition-colors duration-200 ${focused ? "text-orange-500" : "text-gray-400"}`}>
        {icon}
      </span>
      <div className="flex-1 relative h-full flex flex-col justify-center">
        <label htmlFor={id}
          className={`absolute left-0 pointer-events-none transition-all duration-200 font-medium
            ${lifted ? "top-[10px] text-[11px] text-orange-500 tracking-wide" : "top-1/2 -translate-y-1/2 text-[15px] text-gray-400"}`}>
          {label}
        </label>
        <input
          id={id} type={type} value={value} onChange={onChange} required={required}
          autoComplete={id === "email" ? "email" : "current-password"}
          className="bg-transparent border-none outline-none text-[15px] font-semibold text-gray-800 pt-4 w-full"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
      {right && <span className="flex-shrink-0">{right}</span>}
    </div>
  );
};

/* ── Main ───────────────────────────────────────────────────────── */
const LoginPage = () => {
  const [Email, setEmail]       = useState("");
  const [Password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [foodIdx, setFoodIdx]   = useState(0);
  const [foodVisible, setFoodVisible] = useState(true);
  const navigate = useNavigate();

  /* Rotating food emoji */
  useEffect(() => {
    const t = setInterval(() => {
      setFoodVisible(false);
      setTimeout(() => { setFoodIdx(i => (i + 1) % FOODS.length); setFoodVisible(true); }, 200);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  /* Remember me prefill */
  useEffect(() => {
    const s = localStorage.getItem("vnd_rem");
    if (s) { const d = JSON.parse(s); setEmail(d.email); setRemember(true); }
  }, []);

  /* ── handleLogin (zero logic changes) ──────────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/api/vendor/login", { email: Email, password: Password });
      if (res.data.success) {
        const vendor = res.data.vendor;
        if (remember) localStorage.setItem("vnd_rem", JSON.stringify({ email: Email }));
        else localStorage.removeItem("vnd_rem");
        localStorage.setItem("vendor", JSON.stringify(vendor));
        toast.success("Login Successful");
        navigate("/dash");
      } else {
        toast.warn(res.data.message || "Invalid credentials");
        setLoading(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server Error");
      setLoading(false);
    }
  };

  const TRUST = ["SSL Encrypted", "PCI Compliant", "GDPR Safe", "99.9% Uptime"];
  const PILLS = ["Real-time orders", "Instant payouts", "Live analytics", "24/7 support"];
  const STATS = [{ num: "10M+", lbl: "Customers" }, { num: "4.8★", lbl: "Avg. rating" }, { num: "₹2Cr+", lbl: "Paid out" }];

  return (
    <div className="min-h-screen flex font-[Inter,sans-serif]">

      {/* ── LEFT PANEL ─────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between flex-[1.1] bg-[#1c1c1e] relative overflow-hidden px-12 py-12">

        {/* Dot-grid texture */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(249,115,22,0.35) 0%, transparent 70%)", filter: "blur(72px)" }} />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)", filter: "blur(60px)" }} />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-[0_4px_20px_rgba(249,115,22,0.5)]">
            <IconBag />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">VendorHub</span>
          <span className="text-[11px] font-bold text-orange-400 bg-orange-400/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Partner</span>
        </div>

        {/* Hero */}
        <div className="relative z-10 space-y-6">
          {/* Animated emoji */}
          <div className={`text-6xl transition-all duration-200 ${foodVisible ? "opacity-100 scale-100" : "opacity-0 scale-75 rotate-12"}`}>
            {FOODS[foodIdx]}
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight">
            Grow your<br />
            business with<br />
            <span className="text-orange-500">10M+ customers</span>
          </h1>

          <p className="text-[15px] text-white/40 leading-relaxed max-w-sm">
            Join India's largest vendor network. Manage orders, track earnings, and reach millions of hungry customers — all from one dashboard.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6">
            {STATS.map((s, i) => (
              <React.Fragment key={s.num}>
                {i > 0 && <div className="w-px h-10 bg-white/10" />}
                <div>
                  <div className="text-2xl font-black text-white tracking-tight">{s.num}</div>
                  <div className="text-[11px] text-white/35 uppercase tracking-wider mt-0.5">{s.lbl}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Pills */}
        <div className="relative z-10 flex flex-wrap gap-2.5">
          {PILLS.map(p => (
            <div key={p} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[13px] text-white/60 font-medium">
              <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
              {p}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-[400px]">

          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white">
              <IconBag />
            </div>
            <span className="text-lg font-extrabold text-gray-900">VendorHub</span>
          </div>

          <h2 className="text-[28px] font-black text-gray-900 tracking-tight leading-snug">Welcome back 👋</h2>
          <p className="text-[14px] text-gray-400 mt-1.5 leading-relaxed">Sign in to your vendor account to manage your store.</p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mt-6 mb-8">
            <div className="h-1 w-7 rounded-full bg-orange-500" />
            <div className="h-1 w-2 rounded-full bg-gray-200" />
            <div className="h-1 w-2 rounded-full bg-gray-200" />
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">

            {/* Email */}
            <FloatField
              id="email" label="Email address" type="email"
              value={Email} onChange={e => setEmail(e.target.value)}
              required icon={<IconMail />}
            />

            {/* Password */}
            <FloatField
              id="password" label="Password" type={showPwd ? "text" : "password"}
              value={Password} onChange={e => setPassword(e.target.value)}
              required icon={<IconLock />}
              right={
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="text-gray-400 hover:text-orange-500 transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  aria-label={showPwd ? "Hide password" : "Show password"}>
                  {showPwd ? <IconEyeOpen /> : <IconEyeOff />}
                </button>
              }
            />

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <button type="button"
                className="flex items-center gap-2.5 group"
                onClick={() => setRemember(v => !v)}
                aria-checked={remember} role="checkbox">
                <div className={`w-[18px] h-[18px] rounded-md flex items-center justify-center border-[1.5px] transition-all duration-150
                  ${remember ? "bg-orange-500 border-orange-500 text-white" : "border-gray-300 group-hover:border-orange-400"}`}>
                  {remember && <IconCheck />}
                </div>
                <span className="text-[13px] font-medium text-gray-500">Remember me</span>
              </button>

              <button type="button"
                onClick={() => toast.info("Reset link will be sent to your email")}
                className="text-[13px] font-semibold text-orange-500 hover:text-orange-600 hover:underline transition-colors focus:outline-none">
                Forgot password?
              </button>
            </div>

            {/* CTA */}
            <button type="submit" disabled={loading}
              className={`w-full h-[54px] rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-2.5
                transition-all duration-200 mt-2 relative overflow-hidden
                ${loading
                  ? "bg-orange-300 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(249,115,22,0.45)] active:translate-y-0 shadow-[0_4px_18px_rgba(249,115,22,0.35)] cursor-pointer"
                }`}>
              {/* Sheen */}
              <span className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent pointer-events-none" />
              {loading ? (
                <>
                  <span className="w-5 h-5 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <IconArrow />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[12px] text-gray-400 font-medium whitespace-nowrap">Trusted by 50,000+ vendors</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2">
            {TRUST.map(b => (
              <div key={b} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                  <IconShield />
                </div>
                <span className="text-[12px] font-semibold text-gray-500">{b}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="text-center text-[12.5px] text-gray-400 mt-6 leading-relaxed">
            New vendor?{" "}
            <a href="/register" className="text-orange-500 font-bold hover:underline">Create a free account</a>
            {" · "}
            <a href="/terms" className="hover:text-orange-500 transition-colors">Terms</a>
            {" & "}
            <a href="/privacy" className="hover:text-orange-500 transition-colors">Privacy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;