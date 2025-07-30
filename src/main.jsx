import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./components/Auth/AuthContext";
import { AdminProvider } from "./components/Auth/AdminContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AdminProvider>
        <App />
      </AdminProvider>
    </AuthProvider>
  </StrictMode>
);
