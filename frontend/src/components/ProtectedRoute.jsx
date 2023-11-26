import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const userRole = localStorage.getItem("role");

  if (userRole && allowedRoles.includes(userRole)) {
    return element;
  } else {
    // Redirect to a default route or display an error message
    return <Navigate to="/" />;
  }
};

export default ProtectedRoute;
