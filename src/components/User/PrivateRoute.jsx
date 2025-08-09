// components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { isTokenValid } from "../Auth/auth";

export default function PrivateRoute({ element }) {
  return isTokenValid() ? element : <Navigate to="/login" replace />;
}