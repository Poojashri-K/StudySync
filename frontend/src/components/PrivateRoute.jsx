import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Redirects to login if there is no authenticated user
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
