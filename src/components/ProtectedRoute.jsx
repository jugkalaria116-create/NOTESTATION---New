import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const storedRole = sessionStorage.getItem("role");

  // Not logged in
  if (!storedRole) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch
  if (role && storedRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
