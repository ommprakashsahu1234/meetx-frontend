import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { INTERESTS_LIST } from "../utils/interestList";
import { User, Lock, Mail, Phone, MapPin, Globe, Upload, Eye, EyeOff, UserCheck } from "lucide-react";

function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailToken, setEmailToken] = useState("");
  const [gender, setGender] = useState("");
  const [website, setWebsite] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const blockedUsernames = [
    "admin",
    "support",
    "root",
    "system",
    "moderator",
    "login",
    "register",
    "api",
    "home",
    "me",
    "profile",
    "about",
    "contact",
    "dashboard",
    "password",
  ];
  const isBlockedUsername = (username) => {
    return blockedUsernames.includes(username.trim().toLowerCase());
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

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !username || !password || !email || !mobile ||!location) {
      showToast("error", "All fields are required.");
      return false;
    }
    if (!/^\d{10}$/.test(mobile)) {
      showToast("error", "Mobile number must be exactly 10 digits.");
      return false;
    }

    if (!emailRegex.test(email)) {
      showToast("error", "Invalid email format.");
      return false;
    }

    return true;
  };

  const handleSendOtp = async () => {
    if (!validateInputs()) return;
    setSendingOtp(true);
    if (isBlockedUsername(username)) {
      showToast("error", `"${username}" is not available.`);
      return;
    }

    try {
      const formattedName = name
        .toLowerCase()
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      const formattedUsername = username.toLowerCase();
      const formattedEmail = email.toLowerCase();
      const formattedWebsite = website.toLowerCase();

      const res = await axios.post("/user/send-otp", {
        name: formattedName,
        username: formattedUsername,
        password,
        email: formattedEmail,
        mobile,
        location,
        gender,
        website: formattedWebsite,
        demo: false,
        interests,
      });

      if (res.data.success) {
        localStorage.setItem(
          "pendingUser",
          JSON.stringify({
            name: formattedName,
            username: formattedUsername,
            password,
            email: formattedEmail,
            mobile,
            location,
            gender,
            website: formattedWebsite,
            demo: false,
            interests,
          })
        );

        showToast("success", "OTP sent to email");
        setOtpSent(true);
      } else {
        showToast("error", "Failed to send OTP");
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === "username") {
        showToast("error", "Username already exists.");
      } else if (msg === "email") {
        showToast("error", "Email already exists.");
      } else if (msg === "mobile") {
        showToast("error", "Mobile number already exists.");
      } else {
        showToast("error", `Error sending OTP.`);
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);

    const startsWithAlphabet = /^[a-zA-Z]/.test(value);
    const validChars = /^[a-zA-Z0-9._]*$/.test(value);
    const repeatedCharPattern = /(.)\1{3,}/;

    if (value.length > 30) {
      showToast("error", "Username too long (max 30 characters)");
    } else if (!startsWithAlphabet) {
      showToast("error", "Username must start with an alphabet");
    } else if (!validChars) {
      showToast(
        "error",
        "Only letters, numbers, dot (.), and underscore (_) allowed"
      );
    } else if (repeatedCharPattern.test(value)) {
      showToast(
        "error",
        "No character can repeat more than 3 times continuously"
      );
    } else if (isBlockedUsername(value)) {
      showToast("error", `"${value}" is not available.`);
    }
  };

  const handleOtpVerify = async () => {
    const stored = JSON.parse(localStorage.getItem("pendingUser"));
    if (!stored) return showToast("error", "User data missing");

    setVerifyingOtp(true);
    try {
      let uploadedImageUrl = "";
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        const uploadRes = await axios.post(
          "/user/upload?type=profile",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        uploadedImageUrl = uploadRes.data.url;
      }

      const res = await axios.post("/user/verify-otp", {
        ...stored,
        otp,
        profileImageURL: uploadedImageUrl,
      });

      if (res.data.token) {
        localStorage.removeItem("pendingUser");
        localStorage.setItem("token", res.data.token);
        showToast("success", "Registration successful!");
        setTimeout(() => navigate("/"), 1000);
      } else {
        showToast("error", "Invalid OTP");
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes("username"))
        showToast("error", "Username already exists.");
      else if (msg?.includes("email"))
        showToast("error", "Email already exists.");
      else if (msg?.includes("mobile"))
        showToast("error", "Mobile already exists.");
      else showToast("error", "OTP verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <>
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

      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                Create Account
              </h1>
              <p className="text-gray-400 text-lg">Join the MeetX community</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                  <input
                    type="text"
                    placeholder="Enter your Name"
                    className="w-full pl-12 pr-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                  <input
                    type="text"
                    placeholder="Enter your username"
                    className="w-full pl-12 pr-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                    value={username}
                    onChange={handleUsernameChange}
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

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mobile
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                  <input
                    type="tel"
                    placeholder="Enter your Mobile Number"
                    className="w-full pl-12 pr-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                  <input
                    type="text"
                    placeholder="Enter your Location"
                    className="w-full pl-12 pr-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  className="w-full px-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="" className="bg-gray-700">Select Gender</option>
                  <option value="male" className="bg-gray-700">Male</option>
                  <option value="female" className="bg-gray-700">Female</option>
                  <option value="other" className="bg-gray-700">Other</option>
                </select>
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                  <input
                    type="url"
                    placeholder="https://yourwebsite.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Choose up to 5 Interests
              </label>
              <div className="bg-gray-700 border-2 border-gray-600 rounded-2xl p-4 max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {INTERESTS_LIST.map((tag) => (
                    <button
                      key={tag}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 ${
                        interests.includes(tag)
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-lg scale-105"
                          : "bg-gray-600 text-gray-200 border-gray-500 hover:bg-gray-500 hover:border-gray-400 hover:scale-105"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (interests.includes(tag)) {
                          setInterests(interests.filter((i) => i !== tag));
                        } else if (interests.length < 5) {
                          setInterests([...interests, tag]);
                        } else {
                          showToast("error", "Maximum 5 interests allowed");
                        }
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Selected: {interests.length}/5
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Profile Image <span className="text-gray-500">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="profile-image"
                  onChange={(e) => setImage(e.target.files[0])}
                />
                <label
                  htmlFor="profile-image"
                  className="flex items-center justify-center w-full px-4 py-4 bg-gray-700 border-2 border-dashed border-gray-600 rounded-2xl cursor-pointer transition-all duration-300 hover:border-cyan-400 hover:bg-gray-650 group"
                >
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors duration-300" />
                    <span className="text-gray-300 group-hover:text-cyan-300">
                      {image ? image.name : "Choose profile image"}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <button
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-6"
              onClick={handleSendOtp}
              disabled={sendingOtp}
            >
              {sendingOtp ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing you up...</span>
                </div>
              ) : (
                "Sign Up"
              )}
            </button>

            {otpSent && (
              <div className="space-y-4 border-t border-gray-600 pt-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-cyan-400 mb-2">Verify Your Email</h3>
                  <p className="text-gray-400">Enter the OTP sent to your email</p>
                </div>
                
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 text-center text-lg tracking-widest"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                  />
                </div>

                <button
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:from-green-400 hover:to-emerald-500 hover:shadow-xl hover:shadow-green-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  onClick={handleOtpVerify}
                  disabled={verifyingOtp}
                >
                  {verifyingOtp ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying OTP...</span>
                    </div>
                  ) : (
                    "Verify OTP & Complete Registration"
                  )}
                </button>
              </div>
            )}

            <div className="text-center mt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-gray-600"></div>
                <span className="text-gray-400 text-sm">or</span>
                <div className="flex-1 h-px bg-gray-600"></div>
              </div>
              
              <p className="text-gray-300">
                Already a user?{" "}
                <Link 
                  to="/login" 
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-300 hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;