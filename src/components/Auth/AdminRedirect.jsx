import React from "react";
import { Navigate } from "react-router-dom";
import { isAdminTokenValid } from "./adminTokenValid";

function AdminRedirect() {
  const isAdminLoggedIn = isAdminTokenValid();
  return isAdminLoggedIn ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

export default AdminRedirect;
