import { createContext, useState, useEffect, useContext } from "react";
import { isAdminTokenValid } from "./adminAuth";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(isAdminTokenValid());

  const [admin, setAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem("admin");
      return stored && stored !== "undefined" ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Failed to parse admin from localStorage:", error);
      return null;
    }
  });

  useEffect(() => {
    if (!isAdminTokenValid()) {
      setIsAdminLoggedIn(false);
      setAdmin(null);
      localStorage.removeItem("admin-token");
      localStorage.removeItem("admin");
    }
  }, []);

  return (
    <AdminContext.Provider
      value={{ isAdminLoggedIn, setIsAdminLoggedIn, admin, setAdmin }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
