import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const storedRole = sessionStorage.getItem("role");

  if (!storedRole) {
    return <Navigate to="/login" replace />;
  }

  if (role && storedRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
