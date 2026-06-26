import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const vendor = localStorage.getItem("vendor");

  if (!vendor) {
    toast.warning("You must be logged in to access this page");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
