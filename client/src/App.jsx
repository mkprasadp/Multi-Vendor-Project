import { Routes, Route } from "react-router-dom";
import ProductList from "./Components/ProductList";
import AutoLogout from "./services/AutoLogout";
import SaleBanner from "./Components/SaleBanner";
import { SaleProvider, useSale } from "./context/SaleContext";
import HeroBanner from "./Pages/Herobanner";

function Layout() {
  const { isLive } = useSale();

  return (
    <div className={isLive ? "sale-theme" : "normal-theme"}>
      <AutoLogout /> 
      <HeroBanner/>
      <Routes>
        <Route path="/" element={<ProductList />}/>
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <SaleProvider>
      <Layout />
    </SaleProvider>
  );
}