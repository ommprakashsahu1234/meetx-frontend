import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import {
  User,
  AtSign,
  Phone,
  Globe,
  Type,
  Users,
  Mail,
  Lock,
  Activity,
  Settings,
  Save,
  Send,
  Shield,
  Eye,
  Edit3,
} from "lucide-react";

function Account() {
  const [user, setUser] = useState(null);
  const [newData, setNewData] = useState({});
  const [showNewEmailInput, setShowNewEmailInput] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [disableNewEmail, setDisableNewEmail] = useState(false);
  const [otpOld, setOtpOld] = useState("");
  const [otpNew, setOtpNew] = useState("");
  const [toast, setToast] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/user/profile");
        setUser(res.data.user);
        setNewData({
          name: res.data.user.name || "",
          username: res.data.user.username || "",
          mobile: res.data.user.mobile || "",
          website: res.data.user.website || "",
          gender: res.data.user.gender || "",
          bio: res.data.user.bio || "",
        });
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };
    fetchProfile();
  }, []);

  const navigateActivity = async () => {
    navigate("/activities");
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

  const handleChange = (field, value) => {
    setNewData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await axios.post("/user/update-profile", newData);
      showToast("success", "Profile updated successfully");
    } catch (err) {
      const backendError = err?.response?.data?.error || "";
      const message = err?.response?.data?.message || "Update failed";
      if (backendError.includes("username")) {
        showToast("error", "Username already exists.");
      } else if (backendError.includes("email")) {
        showToast("error", "Email already exists.");
      } else if (backendError.includes("mobile")) {
        showToast("error", "Mobile number already exists.");
      } else {
        showToast("error", message);
      }
    }
  };

  const handleEmailButtonClick = () => {
    setShowNewEmailInput(true);
  };

  const handleSendOtp = async () => {
    if (!newEmail || newEmail.trim() === "")
      return showToast("error", "Enter a valid new email");

    if (
      user.email.split("@")[0].replace(/\+.+/, "") ===
      newEmail.split("@")[0].replace(/\+.+/, "")
    ) {
      return showToast("error", "New email must differ from existing.");
    }

    try {
      setSendingOtp(true);
      await axios.post("/user/send-update-email-otp", {
        oldEmail: user.email,
        newEmail,
      });
      showToast("success", "OTP sent to both emails");
      setDisableNewEmail(true);
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await axios.post("/user/verify-update-email", {
        oldEmail: user.email,
        newEmail,
        otpOld,
        otpNew,
      });
      showToast("success", "Email updated successfully");
      setShowNewEmailInput(false);
      setDisableNewEmail(false);
      setOtpOld("");
      setOtpNew("");
      setNewEmail("");
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message || "OTP verification failed"
      );
    }
  };

  const handleRequestPasswordReset = async () => {
    try {
      await axios.post("/user/request-password-reset");
      showToast("success", "Reset token sent to email");
      navigate("/update-password");
    } catch (err) {
      showToast("error", "Failed to send reset token");
    }
  };

  const getFieldIcon = (field) => {
    switch (field) {
      case "name":
        return (
          <User className="w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
        );
      case "username":
        return (
          <AtSign className="w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
        );
      case "mobile":
        return (
          <Phone className="w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
        );
      case "website":
        return (
          <Globe className="w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
        );
      case "bio":
        return (
          <Type className="w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
        );
      default:
        return (
          <Edit3 className="w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Account Settings
                </h1>
                <p className="text-gray-400">
                  Manage your profile and account preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        {user && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-semibold text-gray-100">
                    Profile Information
                  </h2>
                </div>

                <div className="space-y-6">
                  {["name", "username", "mobile", "website", "bio"].map(
                    (field) => (
                      <div key={field} className="relative group">
                        <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                          {field === "bio" ? "Biography" : field}
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            {getFieldIcon(field)}
                          </div>
                          {field === "bio" ? (
                            <textarea
                              className="w-full pl-12 pr-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 resize-none min-h-[100px]"
                              placeholder={`Enter your ${field}...`}
                              value={newData[field]}
                              onChange={(e) =>
                                handleChange(field, e.target.value)
                              }
                              maxLength={150}
                            />
                          ) : (
                            <input
                              type={
                                field === "mobile"
                                  ? "tel"
                                  : field === "website"
                                  ? "url"
                                  : "text"
                              }
                              className="w-full pl-12 pr-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                              placeholder={`Enter your ${field}...`}
                              value={newData[field]}
                              onChange={(e) =>
                                handleChange(field, e.target.value)
                              }
                            />
                          )}
                        </div>
                        {field === "bio" && (
                          <div className="flex justify-end mt-1">
                            <span className="text-gray-500 text-xs">
                              {newData[field]?.length || 0}/150
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  )}

                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Gender
                    </label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-cyan-400 transition-colors duration-300" />
                      <select
                        className="w-full pl-12 pr-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 appearance-none cursor-pointer"
                        value={newData.gender}
                        onChange={(e) => handleChange("gender", e.target.value)}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save Profile</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-xl font-semibold text-gray-100">
                    Account Actions
                  </h2>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleEmailButtonClick}
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-2xl text-gray-100 hover:bg-gray-600 hover:border-cyan-500 transition-all duration-300 flex items-center gap-3 group"
                  >
                    <Mail className="w-5 h-5 text-gray-400 group-hover:text-cyan-400" />
                    <span>Update Email</span>
                  </button>

                  <button
                    onClick={handleRequestPasswordReset}
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-2xl text-gray-100 hover:bg-gray-600 hover:border-yellow-500 transition-all duration-300 flex items-center gap-3 group"
                  >
                    <Lock className="w-5 h-5 text-gray-400 group-hover:text-yellow-400" />
                    <span>Update Password</span>
                  </button>

                  <button
                    onClick={navigateActivity}
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-2xl text-gray-100 hover:bg-gray-600 hover:border-green-500 transition-all duration-300 flex items-center gap-3 group"
                  >
                    <Activity className="w-5 h-5 text-gray-400 group-hover:text-green-400" />
                    <span>View Activities</span>
                  </button>
                </div>
              </div>

              {showNewEmailInput && (
                <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-6">
                    <Mail className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-xl font-semibold text-gray-100">
                      Update Email
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-cyan-400 transition-colors duration-300" />
                      <input
                        type="email"
                        className="w-full pl-12 pr-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter new email address"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        disabled={disableNewEmail}
                      />
                    </div>

                    {!disableNewEmail && (
                      <button
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:from-green-400 hover:to-emerald-500 hover:shadow-xl hover:shadow-green-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                      >
                        {sendingOtp ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Sending OTP...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Send OTP</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {disableNewEmail && (
                <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-xl font-semibold text-gray-100">
                      Verify OTP
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="relative group">
                      <input
                        type="text"
                        className="w-full px-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                        placeholder="Enter OTP from old email"
                        value={otpOld}
                        onChange={(e) => setOtpOld(e.target.value)}
                      />
                    </div>

                    <div className="relative group">
                      <input
                        type="text"
                        className="w-full px-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                        placeholder="Enter OTP from new email"
                        value={otpNew}
                        onChange={(e) => setOtpNew(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={handleVerifyOtp}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:from-green-400 hover:to-emerald-500 hover:shadow-xl hover:shadow-green-500/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      <Eye className="w-5 h-5" />
                      <span>Verify & Update Email</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
              <div
                className={`w-2 h-2 rounded-full ${
                  toast.type === "success" ? "bg-green-400" : "bg-red-400"
                } animate-pulse`}
              ></div>
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Account;
