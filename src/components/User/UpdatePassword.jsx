import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { 
  Lock, 
  Key, 
  Shield, 
  Eye, 
  EyeOff, 
  Mail,
  ArrowLeft,
  CheckCircle,
  X
} from "lucide-react";

function UpdatePassword() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleSubmit = async () => {
    if (!token || !newPassword || !confirm)
      return showToast("error", "All fields required");
    if (newPassword !== confirm)
      return showToast("error", "Passwords do not match");
    if (newPassword.length < 6)
      return showToast("error", "Password must be at least 6 characters");

    try {
      setLoading(true);
      await axios.post("/user/update-password", { token, newPassword });
      showToast("success", "Password updated successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "", color: "" };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { text: "Very Weak", color: "text-red-500" },
      { text: "Weak", color: "text-orange-500" },
      { text: "Fair", color: "text-yellow-500" },
      { text: "Good", color: "text-blue-500" },
      { text: "Strong", color: "text-green-500" }
    ];

    return { strength, ...levels[Math.min(strength, 4)] };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back to Login</span>
          </button>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-8">
            <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Reset Password
            </h1>
            <p className="text-gray-400 text-lg">Enter your reset token and new password</p>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reset Token
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                <input
                  type="text"
                  placeholder="Enter reset token from email"
                  className="w-full pl-12 pr-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Check your email for the reset token
              </p>
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full pl-12 pr-12 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors duration-300"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Password Strength</span>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength <= 1
                          ? "bg-red-500"
                          : passwordStrength.strength <= 2
                          ? "bg-orange-500"
                          : passwordStrength.strength <= 3
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className={`w-full pl-12 pr-12 py-4 bg-gray-700 border-2 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 hover:border-gray-500 ${
                    confirm && newPassword
                      ? newPassword === confirm
                        ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                        : "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-600 focus:border-cyan-500 focus:ring-cyan-500/20"
                  }`}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors duration-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {confirm && (
                <div className="flex items-center gap-2 mt-2">
                  {newPassword === confirm ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-500">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-500">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !token || !newPassword || !confirm}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-700/50 border border-gray-600 rounded-2xl">
            <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Security Tips
            </h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Use at least 8 characters</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Add numbers and special characters</li>
              <li>• Avoid using personal information</li>
            </ul>
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

export default UpdatePassword;
