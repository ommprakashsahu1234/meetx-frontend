import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { isTokenValid } from "../Auth/auth";
import { AuthContext } from "../Auth/AuthContext";
import { User, Lock, Eye, EyeOff } from "lucide-react";

function Login() {
  const [toast, setToast] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setIsLoggedIn, setUser } = useContext(AuthContext);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (isTokenValid()) {
      localStorage.removeItem("token");
      console.log(
        "User auto-logged out due to accessing login while authenticated."
      );
    }
  }, []);

  const handleLogin = async () => {
    if (!username || !password)
      return showToast("error", "Please Fill all the Details. !");
    setLoading(true);

    try {
      const res = await axios.post("/user/login", {
        username: username.toLowerCase(), 
        password, 
      });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setIsLoggedIn(true);
        setUser(res.data.user);
        navigate("/");
      } else {
        showToast("error", "Signin Failed! CODE - ERRNTKN!");
      }
    } catch (err) {
      console.error("Login error:", err);

      const msg = err.response?.data?.message;

      if (msg?.includes("banned")) {
        showToast("error", msg);
      } else if (msg?.includes("Invalid credentials")) {
        showToast("error", "Incorrect username or password.");
      } else {
        showToast("error", "Sign in failed. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-lg">Sign in to your account</p>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-600"></div>
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-600"></div>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-300">
                Not a user?{" "}
                <Link 
                  to="/register" 
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-300 hover:underline"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 duration-300">
          <div
            className={`px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
              toast.type === "success" 
                ? "bg-green-800/90 border-green-600 text-green-100" 
                : "bg-red-800/90 border-red-600 text-red-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                toast.type === "success" ? "bg-green-400" : "bg-red-400"
              } animate-pulse`}></div>
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;