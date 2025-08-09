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
  X,
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
  const [checkingAuth, setCheckingAuth] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setCheckingAuth(false);
    else navigate("/login");
  }, [navigate]);

  const neonStyle = {
    filter: "drop-shadow(0 0 1.5px #099) drop-shadow(0 0 3px #099)",
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  if (checkingAuth) return null;

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
      { text: "Strong", color: "text-green-500" },
    ];

    return { strength, ...levels[Math.min(strength, 4)] };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen bg-[#172133] flex items-center justify-center p-4 text-[#0bb]">
      <div className="w-full max-w-md">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-[#5599bb] hover:text-[#0bb] transition-colors duration-300 group"
          >
            <ArrowLeft
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300"
              style={neonStyle}
            />
            <span>Back to Login</span>
          </button>
        </div>

        {/* Form container */}
        <div className="bg-[#1a2b46] border border-[#1f2a47] rounded-3xl p-8 shadow-neonBtn backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="p-4 bg-gradient-to-r from-[#0bb] to-[#145279] rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-neonBtn">
              <Shield className="w-8 h-8 text-white" style={neonStyle} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0bb] to-[#145279] bg-clip-text text-transparent mb-2">
              Reset Password
            </h1>
            <p className="text-[#5599bb] text-lg">
              Enter your reset token and new password
            </p>
          </div>

          {/* Inputs */}
          <div className="space-y-6">
            {/* Reset Token */}
            <div className="relative group">
              <label className="block text-sm font-medium text-[#88bbdd] mb-2">
                Reset Token
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4488bb] w-5 h-5 transition-colors duration-300 group-focus-within:text-[#0bb]"
                  style={neonStyle}
                />
                <input
                  type="text"
                  placeholder="Enter reset token from email"
                  className="w-full pl-12 pr-4 py-4 bg-[#1a2b46] border-2 border-[#1f2a47] rounded-2xl text-[#0bb] placeholder-[#0a4d74] focus:outline-none focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/30 transition-all duration-300 hover:border-[#145279]"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
              <p className="text-xs text-[#5599bb] mt-1">
                Check your email for the reset token
              </p>
            </div>

            {/* New Password */}
            <div className="relative group">
              <label className="block text-sm font-medium text-[#88bbdd] mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4488bb] w-5 h-5 transition-colors duration-300 group-focus-within:text-[#0bb]"
                  style={neonStyle}
                />
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full pl-12 pr-12 py-4 bg-[#1a2b46] border-2 border-[#1f2a47] rounded-2xl text-[#0bb] placeholder-[#0a4d74] focus:outline-none focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/30 transition-all duration-300 hover:border-[#145279]"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#4488bb] hover:text-[#0bb] transition-colors duration-300"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Strength */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#5599bb]">
                      Password Strength
                    </span>
                    <span
                      className={`text-xs font-medium ${passwordStrength.color}`}
                    >
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-[#1f2a47] rounded-full h-2">
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
                      style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative group">
              <label className="block text-sm font-medium text-[#88bbdd] mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Key
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4488bb] w-5 h-5 transition-colors duration-300 group-focus-within:text-[#0bb]"
                  style={neonStyle}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className={`w-full pl-12 pr-12 py-4 bg-[#1a2b46] rounded-2xl text-[#0bb] placeholder-[#0a4d74] focus:outline-none focus:ring-4 transition-all duration-300 hover:border-[#145279] ${
                    confirm && newPassword
                      ? newPassword === confirm
                        ? "border-2 border-green-500 focus:border-green-500 focus:ring-green-500/20"
                        : "border-2 border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-2 border-[#1f2a47] focus:border-[#0bb] focus:ring-[#0bb]/20"
                  }`}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#4488bb] hover:text-[#0bb] transition-colors duration-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {confirm && (
                <div className="flex items-center gap-2 mt-2">
                  {newPassword === confirm ? (
                    <>
                      <CheckCircle
                        className="w-4 h-4 text-green-500"
                        style={neonStyle}
                      />
                      <span className="text-sm text-green-500">
                        Passwords match
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-red-500" style={neonStyle} />
                      <span className="text-sm text-red-500">
                        Passwords do not match
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !token || !newPassword || !confirm}
              className="w-full py-4 bg-gradient-to-r from-[#0bb] to-[#145279] text-white font-semibold rounded-2xl shadow-neonBtn transition-all duration-300 hover:from-[#099] hover:to-[#0a4d74] hover:shadow-neonBtn hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" style={neonStyle} />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>

          {/* Security Tips */}
          <div className="mt-8 p-4 bg-[#1a2b46]/80 border border-[#1f2a47] rounded-2xl text-[#5599bb] text-sm">
            <h3 className="flex items-center gap-2 font-semibold mb-2">
              <Shield className="w-4 h-4 text-[#0bb]" style={neonStyle} />
              Security Tips
            </h3>
            <ul className="space-y-1 text-[#88bbdd] text-xs">
              <li>• Use at least 8 characters</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Add numbers and special characters</li>
              <li>• Avoid using personal information</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 duration-300">
          <div
            className={`px-6 py-4 rounded-2xl shadow-neonBtn border backdrop-blur-md ${
              toast.type === "success"
                ? "bg-green-900/90 border-green-600 text-green-200"
                : "bg-red-900/90 border-red-600 text-red-200"
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
        .shadow-neonBtn {
          box-shadow: 0 0 4px #0bb7, 0 0 10px #0bb8a;
        }
      `}</style>
    </div>
  );
}

export default UpdatePassword;
