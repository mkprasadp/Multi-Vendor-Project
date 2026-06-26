import { useSale } from "../context/SaleContext";

export default function SaleBanner() {
  const { isLive, countdown } = useSale();

  return (
    <div
      className={`w-full py-4 px-6 text-center transition-all duration-500 ${
        isLive
          ? "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white shadow-lg"
          : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2">
        {isLive ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">🔥</span>
              <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wider">
                BIG BILL SALE LIVE
              </h2>
            </div>

            <span className="hidden md:block text-xl font-bold">|</span>

            <div className="text-lg md:text-xl font-semibold">
              Ends In
              <span className="ml-2 bg-white text-red-600 px-3 py-1 rounded-lg font-bold shadow">
                {countdown}
              </span>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wider">
                🎉 BIG BILL SALE STARTS IN
              </h2>
            </div>

            <div className="text-lg md:text-xl font-semibold">
              <span className="bg-white text-indigo-700 px-3 py-1 rounded-lg font-bold shadow">
                {countdown}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}