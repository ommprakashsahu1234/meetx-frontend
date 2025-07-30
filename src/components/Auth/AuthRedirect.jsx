import React from "react";
import { Navigate } from "react-router-dom";
import { isTokenValid } from "../Auth/auth";

function AuthRedirect() {
  const isLoggedIn = isTokenValid();
  return isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
}

export default AuthRedirect;
