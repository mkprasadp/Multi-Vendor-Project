import { createContext, useContext, useEffect, useState } from "react";

const SaleContext = createContext();

export const SaleProvider = ({ children }) => {
  const [sale, setSale] = useState({
    isLive: false,
    countdown: "",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();

      const start = new Date("2026-07-22T00:00:00");
      const end = new Date("2026-06-24T00:00:00");

      if (now >= start && now <= end) {
        const diff = end - now;

        setSale({
          isLive: true,
          countdown: format(diff),
        });
      } else {
        const diff = start - now;

        setSale({
          isLive: false,
          countdown: format(diff),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format = (ms) => {
    if (ms <= 0) return "00:00:00";

    const d = Math.floor(ms / (1000 * 60 * 60 * 24));
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const s = Math.floor((ms / 1000) % 60);

    return `${d}d ${h}h ${m}m ${s}s`;
  };

  return (
    <SaleContext.Provider value={sale}>
      {children}
    </SaleContext.Provider>
  );
};

export const useSale = () => useContext(SaleContext);