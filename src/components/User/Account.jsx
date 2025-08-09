import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";
import axios from "../utils/axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Auth/AuthContext";
import defaultAvatar from "../../assets/images/user.png";
import verifiedIcon from "../../assets/images/verified.svg";
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
  const [checkingAuth, setCheckingAuth] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setCheckingAuth(false);
    else navigate("/login");
  }, [navigate]);

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
    const neonStyle = {
      filter: "drop-shadow(0 0 1.5px #099) drop-shadow(0 0 3px #099)",
    };
    switch (field) {
      case "name":
        return (
          <User
            className="w-5 h-5 text-[#4488bb] group-focus-within:text-[#0bb] transition-colors duration-300"
            style={neonStyle}
          />
        );
      case "username":
        return (
          <AtSign
            className="w-5 h-5 text-[#4488bb] group-focus-within:text-[#0bb] transition-colors duration-300"
            style={neonStyle}
          />
        );
      case "mobile":
        return (
          <Phone
            className="w-5 h-5 text-[#4488bb] group-focus-within:text-[#0bb] transition-colors duration-300"
            style={neonStyle}
          />
        );
      case "website":
        return (
          <Globe
            className="w-5 h-5 text-[#4488bb] group-focus-within:text-[#0bb] transition-colors duration-300"
            style={neonStyle}
          />
        );
      case "bio":
        return (
          <Type
            className="w-5 h-5 text-[#4488bb] group-focus-within:text-[#0bb] transition-colors duration-300"
            style={neonStyle}
          />
        );
      default:
        return (
          <Edit3
            className="w-5 h-5 text-[#4488bb] group-focus-within:text-[#0bb] transition-colors duration-300"
            style={neonStyle}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#172133] p-4 text-[#0bb]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-6 shadow-subtleNeon backdrop-blur-md flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-[#0bb] to-[#145279] rounded-2xl shadow-subtleNeonBtn">
              <Settings
                className="w-6 h-6 text-white"
                style={{ filter: "drop-shadow(0 0 2px #0bb)" }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0bb] to-[#145279] bg-clip-text text-transparent">
                Account Settings
              </h1>
              <p className="text-[#5588aa]">
                Manage your profile and account preferences
              </p>
            </div>
          </div>
        </div>

        {user && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 text-[#0bb]">
            <div className="xl:col-span-2">
              <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-6 shadow-subtleNeon backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                  <User
                    className="w-6 h-6 text-[#0bb]"
                    style={{ filter: "drop-shadow(0 0 2px #099)" }}
                  />
                  <h2 className="text-2xl font-semibold text-[#0bb]">
                    Profile Information
                  </h2>
                </div>

                <div className="space-y-6">
                  {["name", "username", "mobile", "website", "bio"].map(
                    (field) => (
                      <div key={field} className="relative group text-[#0bb]">
                        <label className="block text-sm font-medium mb-2 capitalize">
                          {field === "bio" ? "Biography" : field}
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            {getFieldIcon(field)}
                          </div>
                          {field === "bio" ? (
                            <textarea
                              className="w-full pl-12 pr-4 py-4 bg-[#1a2b46] border-2 border-[#1f2a47] rounded-2xl text-[#0bb] placeholder-[#0a4d74] focus:outline-none focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/40 transition-all duration-300 hover:border-[#145279] resize-none min-h-[100px]"
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
                              className="w-full pl-12 pr-4 py-4 bg-[#1a2b46] border-2 border-[#1f2a47] rounded-2xl text-[#0bb] placeholder-[#0a4d74] focus:outline-none focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/40 transition-all duration-300 hover:border-[#145279]"
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
                            <span className="text-[#5588aa] text-xs">
                              {newData[field]?.length || 0}/150
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  )}
                  <div className="relative group">
                    <label className="block text-sm font-medium mb-2">
                      Gender
                    </label>
                    <div className="relative">
                      <Users
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4488bb] group-focus-within:text-[#0bb] transition-colors duration-300"
                        style={{ filter: "drop-shadow(0 0 1.5px #099)" }}
                      />
                      <select
                        className="w-full pl-12 pr-4 py-4 bg-[#1a2b46] border-2 border-[#1f2a47] rounded-2xl text-[#0bb] focus:outline-none focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/40 transition-all duration-300 hover:border-[#145279] appearance-none cursor-pointer"
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
                    className="w-full py-4 bg-gradient-to-r from-[#0bb] to-[#145279] text-white font-semibold rounded-2xl shadow-softNeonBtn transition-all duration-300 hover:from-[#099] hover:to-[#0a4d74] hover:shadow-softNeonBtnHover hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Save
                      className="w-5 h-5"
                      style={{ filter: "drop-shadow(0 0 1.5px #099)" }}
                    />
                    <span>Save Profile</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-6 shadow-subtleNeon backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                  <Shield
                    className="w-6 h-6 text-[#0bb]"
                    style={{ filter: "drop-shadow(0 0 1.5px #099)" }}
                  />
                  <h2 className="text-xl font-semibold text-[#0bb]">
                    Account Actions
                  </h2>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleEmailButtonClick}
                    className="w-full p-4 bg-[#1a2b46] border border-[#1f2a47] rounded-2xl text-[#0bb] hover:bg-[#273b62] hover:border-[#0dd] transition-all duration-300 flex items-center gap-3 group"
                  >
                    <Mail
                      className="w-5 h-5 text-[#4488bb] group-hover:text-[#0dd]"
                      style={{ filter: "drop-shadow(0 0 1.5px #099)" }}
                    />
                    <span>Update Email</span>
                  </button>

                  <button
                    onClick={handleRequestPasswordReset}
                    className="w-full p-4 bg-[#1a2b46] border border-[#1f2a47] rounded-2xl text-[#0bb] hover:bg-[#273b62] hover:border-yellow-500 transition-all duration-300 flex items-center gap-3 group"
                  >
                    <Lock
                      className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300"
                      style={{ filter: "drop-shadow(0 0 1.5px #aa8)" }}
                    />
                    <span>Update Password</span>
                  </button>

                  <button
                    onClick={navigateActivity}
                    className="w-full p-4 bg-[#1a2b46] border border-[#1f2a47] rounded-2xl text-[#0bb] hover:bg-[#273b62] hover:border-green-500 transition-all duration-300 flex items-center gap-3 group"
                  >
                    <Activity
                      className="w-5 h-5 text-green-400 group-hover:text-green-300"
                      style={{ filter: "drop-shadow(0 0 1.5px #6a6)" }}
                    />
                    <span>View Activities</span>
                  </button>
                </div>
              </div>

              {showNewEmailInput && (
                <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-6 shadow-subtleNeon backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-6">
                    <Mail
                      className="w-6 h-6 text-[#0bb]"
                      style={{ filter: "drop-shadow(0 0 1.5px #099)" }}
                    />
                    <h2 className="text-xl font-semibold text-[#0bb]">
                      Update Email
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="relative group">
                      <Mail
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4488bb] w-5 h-5 group-focus-within:text-[#0dd] transition-colors duration-300"
                        style={{ filter: "drop-shadow(0 0 1.5px #099)" }}
                      />
                      <input
                        type="email"
                        className="w-full pl-12 pr-4 py-4 bg-[#1a2b46] border-2 border-[#1f2a47] rounded-2xl text-[#0bb] placeholder-[#0a4d74] focus:outline-none focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/40 transition-all duration-300 hover:border-[#145279] disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-2xl shadow-softNeonBtn transition-all duration-300 hover:from-green-500 hover:to-emerald-600 hover:shadow-softNeonBtnHover hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {sendingOtp ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Sending OTP...</span>
                          </>
                        ) : (
                          <>
                            <Send
                              className="w-5 h-5"
                              style={{ filter: "drop-shadow(0 0 1.5px #099)" }}
                            />
                            <span>Send OTP</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {disableNewEmail && (
                <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-6 shadow-subtleNeon backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield
                      className="w-6 h-6 text-[#0bb]"
                      style={{ filter: "drop-shadow(0 0 1.5px #099)" }}
                    />
                    <h2 className="text-xl font-semibold text-[#0bb]">
                      Verify OTP
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      className="w-full px-4 py-4 bg-[#1a2b46] border-2 border-[#1f2a47] rounded-2xl text-[#0bb] placeholder-[#0a4d74] focus:outline-none focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/40 transition-all duration-300 hover:border-[#145279]"
                      placeholder="Enter OTP from old email"
                      value={otpOld}
                      onChange={(e) => setOtpOld(e.target.value)}
                    />
                    <input
                      type="text"
                      className="w-full px-4 py-4 bg-[#1a2b46] border-2 border-[#1f2a47] rounded-2xl text-[#0bb] placeholder-[#0a4d74] focus:outline-none focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/40 transition-all duration-300 hover:border-[#145279]"
                      placeholder="Enter OTP from new email"
                      value={otpNew}
                      onChange={(e) => setOtpNew(e.target.value)}
                    />
                    <button
                      onClick={handleVerifyOtp}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-2xl shadow-softNeonBtn transition-all duration-300 hover:from-green-500 hover:to-emerald-600 hover:shadow-softNeonBtnHover hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                    >
                      <Eye
                        className="w-5 h-5"
                        style={{ filter: "drop-shadow(0 0 1.5px #099)" }}
                      />
                      <span>Verify & Update Email</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 duration-300">
            <div
              className={`px-6 py-4 rounded-2xl shadow-subtleNeon border backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-green-900/90 border-green-700 text-green-200"
                  : "bg-red-900/90 border-red-700 text-red-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    toast.type === "success" ? "bg-green-500" : "bg-red-500"
                  } animate-pulse`}
                ></div>
                <span className="font-medium">{toast.message}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Very Subtle Neon Shadows */
        .shadow-subtleNeon {
          box-shadow: 0 0 2px #099, 0 0 6px #09930a1a;
        }
        .shadow-subtleNeonHover:hover {
          box-shadow: 0 0 3px #099, 0 0 9px #09930a1a;
        }
        .shadow-subtleNeonBtn {
          box-shadow: 0 0 2px #09960a1a;
        }
        .shadow-subtleNeonBtnHover:hover {
          box-shadow: 0 0 4px #099, 0 0 8px #09930a1a;
        }
        .shadow-subtleNeonDropdown {
          box-shadow: 0 0 6px #09930a1a, 0 0 12px #09920a1a;
        }
      `}</style>
    </div>
  );
}

export default Account;
