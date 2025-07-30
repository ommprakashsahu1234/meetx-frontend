import { createContext, useState, useEffect, useContext } from "react";
import { isTokenValid } from "./auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(isTokenValid());
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (!isTokenValid()) {
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
