import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { isAdminTokenValid } from "../Auth/adminAuth";
import { AdminContext } from "../Auth/AdminContext";
import { 
  Shield, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  Crown,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

function AdminLogin() {
  const [toast, setToast] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setIsAdminLoggedIn, setAdmin } = useContext(AdminContext);

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
    if (isAdminTokenValid()) {
      localStorage.removeItem("admin-token");
      localStorage.removeItem("admin");
      console.log("Admin auto-logged out due to accessing login while authenticated.");
    }
  }, []);

  const handleLogin = async () => {
    if (!username || !password)
      return showToast("error", "Please fill all fields.");
    setLoading(true);

    try {
      const res = await axios.post("/admin/login", { username, password });
      if (res.data.token) {
        localStorage.setItem("admin-token", res.data.token);
        localStorage.setItem("admin", JSON.stringify(res.data.admin));
        setIsAdminLoggedIn(true);
        setAdmin(res.data.admin);
        showToast("success", "Login successful! Redirecting...");
        setTimeout(() => navigate("/admin"), 500);
      } else {
        showToast("error", "Login failed. Invalid response!");
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      showToast("error", msg || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gray-800/95 border border-gray-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-8">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl shadow-2xl"></div>
              <div className="absolute inset-2 bg-gray-800 rounded-xl flex items-center justify-center">
                <Crown className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 p-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text mb-2">
              Admin Portal
            </h1>
            <p className="text-gray-400">
              Secure administrative access to MeetX platform
            </p>
          </div>

          <div className="space-y-6">
            {/* Username Field */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Administrator Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                <input
                  type="text"
                  placeholder="Enter admin username"
                  className="w-full pl-12 pr-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Administrator Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  className="w-full pl-12 pr-12 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-300"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading || !username || !password}
              className={`w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 ${
                loading || !username || !password
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl hover:shadow-cyan-500/25"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Access Admin Panel</span>
                </>
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium text-sm mb-1">
                  Restricted Access
                </p>
                <p className="text-red-200 text-xs leading-relaxed">
                  This portal is exclusively for authorized administrators. 
                  Unauthorized access is prohibited and monitored.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              MeetX Administrative System v2.0
            </p>
          </div>
        </div>

        {/* Additional Security Info */}
        <div className="mt-6 bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <Shield className="w-4 h-4" />
            <span>Secured with enterprise-grade encryption</span>
          </div>
        </div>
      </div>

      {/* Enhanced Toast Notifications */}
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
              {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              <div>
                <p className="font-medium">{toast.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-top-2 {
          animation: slideInFromTop 0.3s ease-out forwards;
        }
        
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default AdminLogin;