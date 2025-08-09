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
    <div className="flex items-center justify-center min-h-screen bg-[#172133] p-4 text-[#0bb]">
      <div className="w-full max-w-md">
        <div className="bg-[#1a2b46] border border-[#0bb] rounded-3xl p-8 shadow-subtleNeon backdrop-blur-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#0bb] to-[#14639d] bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-[#5599bb] text-base sm:text-lg">Sign in to your account</p>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <label className="block text-sm sm:text-base font-medium text-[#5599bb] mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#5599bb] w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 group-focus-within:text-[#0bb]" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-4 bg-[#172133] border-2 border-[#0bb] rounded-2xl text-[#0bb] placeholder-[#0bb]/70 focus:outline-none focus:ring-4 focus:ring-[#0bb]/30 focus:border-[#0bb] transition-all duration-300 hover:border-[#0a4d74]"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="relative group">
              <label className="block text-sm sm:text-base font-medium text-[#5599bb] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#5599bb] w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 group-focus-within:text-[#0bb]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-[#172133] border-2 border-[#0bb] rounded-2xl text-[#0bb] placeholder-[#0bb]/70 focus:outline-none focus:ring-4 focus:ring-[#0bb]/30 focus:border-[#0bb] transition-all duration-300 hover:border-[#0a4d74]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#5599bb] hover:text-[#0bb] transition-colors duration-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </button>
              </div>
            </div>

            <button
              className="w-full py-4 bg-gradient-to-r from-[#0bb] to-[#14639d] text-black font-semibold rounded-2xl shadow-neonBtn transition-transform duration-300 hover:from-[#099] hover:to-[#0a4d74] hover:shadow-neonBtn hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[#0bb]/30"></div>
              <span className="text-[#5599bb] text-sm sm:text-base">or</span>
              <div className="flex-1 h-px bg-[#0bb]/30"></div>
            </div>

            <div className="space-y-3">
              <p className="text-[#5599bb] text-sm sm:text-base">
                Not a user?{" "}
                <Link
                  to="/register"
                  className="text-[#0bb] hover:text-[#14639d] font-semibold transition-colors duration-300 hover:underline"
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
            className={`px-6 py-4 rounded-3xl shadow-neonBtn border backdrop-blur-md max-w-xs sm:max-w-sm ${
              toast.type === "success"
                ? "bg-green-900/90 border-green-700 text-green-200"
                : "bg-red-900/90 border-red-700 text-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  toast.type === "success" ? "bg-green-400" : "bg-red-400"
                } animate-pulse`}
              ></div>
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .shadow-subtleNeon {
          box-shadow: 0 0 3px #0bb6, 0 0 8px #0bb5a;
        }
        .shadow-neonBtn {
          box-shadow: 0 0 4px #0bb8, 0 0 10px #0bb8a;
        }
      `}</style>
    </div>
  );
}

export default Login;
