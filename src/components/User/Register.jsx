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
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [gender, setGender] = useState("");
  const [website, setWebsite] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const blockedUsernames = [
    "admin", "support", "root", "system", "moderator",
    "login", "register", "api", "home", "me",
    "profile", "about", "contact", "dashboard", "password",
  ];
  const isBlockedUsername = (username) => blockedUsernames.includes(username.trim().toLowerCase());

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !username || !password || !email || !mobile || !location) {
      showToast("error", "All required fields must be filled.");
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
    if (isBlockedUsername(username)) {
      showToast("error", `"${username}" is not available.`);
      return;
    }
    setSendingOtp(true);

    const formattedName = name.trim().toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const formattedUsername = username.trim().toLowerCase();
    const formattedEmail = email.trim().toLowerCase();
    const formattedWebsite = website.trim().toLowerCase();

    try {
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
        localStorage.setItem("pendingUser", JSON.stringify({
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
        }));

        showToast("success", "OTP sent to email.");
        setOtpSent(true);
      } else {
        showToast("error", "Failed to send OTP.");
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === "username") showToast("error", "Username already exists.");
      else if (msg === "email") showToast("error", "Email already exists.");
      else if (msg === "mobile") showToast("error", "Mobile number already exists.");
      else showToast("error", "Error occurred sending OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);

    // Validation rules similar to original with no immediate toast flooding:
    if (value.length > 30 || 
      !/^[a-zA-Z]/.test(value) ||
      !/^[a-zA-Z0-9._]*$/.test(value) ||
      /(.)\1{3,}/.test(value) ||
      isBlockedUsername(value)) {
      // Defer validation to on blur or submission, or show subtle UI warning if desired
      // Here we show toast once per attempt
      // Adjust as needed
      // For now, show last validation error found:
      if(value.length > 30) showToast("error", "Username too long (max 30 characters)");
      else if(!/^[a-zA-Z]/.test(value)) showToast("error", "Username must start with a letter");
      else if(!/^[a-zA-Z0-9._]*$/.test(value)) showToast("error", "Only letters, digits, dot, and underscore allowed");
      else if(/(.)\1{3,}/.test(value)) showToast("error", "No character repeats more than 3 times consecutively");
      else if(isBlockedUsername(value)) showToast("error", `"${value}" is not available.`);
    }
  };

  const handleOtpVerify = async () => {
    const stored = JSON.parse(localStorage.getItem("pendingUser"));
    if (!stored) return showToast("error", "User data missing.");

    setVerifyingOtp(true);
    try {
      let uploadedImageUrl = "";
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        const uploadRes = await axios.post("/user/upload?type=profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
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
        showToast("error", "Invalid OTP.");
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes("username")) showToast("error", "Username already exists.");
      else if (msg?.includes("email")) showToast("error", "Email already exists.");
      else if (msg?.includes("mobile")) showToast("error", "Mobile already exists.");
      else showToast("error", "OTP verification failed.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <>
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-top duration-300">
          <div className={`px-6 py-3 rounded-3xl shadow-neonBtn border backdrop-blur-md ${toast.type === 'success' ? 'bg-green-900 border-green-700 text-green-200' : 'bg-red-900 border-red-700 text-red-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${toast.type === 'success' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center min-h-screen bg-[#172133] p-4 text-[#0bb]">
        <div className="w-full max-w-2xl">
          <div className="bg-[#1a2b46] rounded-3xl border border-[#0bb] p-8 shadow-neonBtn backdrop-blur-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#0bb] to-[#14639d] bg-clip-text text-transparent mb-1">
                Create Your Account
              </h1>
              <p className="text-[#559] text-lg">Join the MeetX community</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {[{
                label: "Full Name",
                icon: User,
                value: name,
                setValue: setName,
                placeholder: "Enter your name",
                required: true,
                type: "text",
              },
              {
                label: "Username",
                icon: UserCheck,
                value: username,
                setValue: setUsername,
                placeholder: "Choose a username",
                required: true,
                onChange: handleUsernameChange,
                type: "text",
              },
              {
                label: "Password",
                icon: Lock,
                value: password,
                setValue: setPassword,
                placeholder: "Choose a password",
                required: true,
                type: showPassword ? "text" : "password",
                passwordToggle: true,
                showPassword: showPassword,
                toggleShowPassword: () => setShowPassword(!showPassword),
              },
              {
                label: "Email",
                icon: Mail,
                value: email,
                setValue: setEmail,
                placeholder: "Enter your email",
                required: true,
                type: "email",
              },
              {
                label: "Mobile",
                icon: Phone,
                value: mobile,
                setValue: setMobile,
                placeholder: "Enter your mobile number",
                required: true,
                type: "tel",
              },
              {
                label: "Location",
                icon: MapPin,
                value: location,
                setValue: setLocation,
                placeholder: "Enter your location",
                required: true,
                type: "text",
              }
              ].map(({ label, icon: IconComp, value, setValue, placeholder, required, type, onChange, passwordToggle, showPassword, toggleShowPassword }, idx) => (
                <div key={idx} className="relative group">
                  <label className="block text-sm font-medium text-[#559] mb-2">{label}{required ? '' : ' (Optional)'}</label>
                  <div className="relative">
                    <IconComp className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#559] w-5 h-5 transition-colors duration-300 group-focus-within:text-[#0bb]" />
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={value}
                      onChange={onChange || (e => setValue(e.target.value))}
                      className="w-full pl-12 pr-4 py-4 bg-[#172133] border border-[#0bb] rounded-3xl text-[#0bb] placeholder-[#0bb]/60 focus:outline-none focus:ring-2 focus:ring-[#0bb] transition"
                    />
                    {passwordToggle && (
                      <button type="button" onClick={toggleShowPassword} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#559] hover:text-[#0bb] transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#559] mb-2">Gender</label>
              <select
                className="w-full bg-[#172133] border border-[#0bb] rounded-3xl py-4 px-4 text-[#0bb] focus:ring-2 focus:ring-[#0bb] transition"
                value={gender}
                onChange={e => setGender(e.target.value)}
              >
                <option value="" className="bg-[#172133]">Select Gender</option>
                <option value="male" className="bg-[#172133]">Male</option>
                <option value="female" className="bg-[#172133]">Female</option>
                <option value="other" className="bg-[#172133]">Other</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#559] mb-2">Website (Optional)</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#559] w-5 h-5 transition-colors duration-300 focus-within:text-[#0bb]" />
                <input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#172133] border border-[#0bb] rounded-3xl text-[#0bb] placeholder-[#0bb]/60 transition focus:outline-none focus:ring-2 focus:ring-[#0bb]"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#559] mb-2">Select up to 5 Interests</label>
              <div className="bg-[#172133] border border-[#0bb] rounded-3xl p-4 max-h-48 overflow-auto">
                <div className="flex flex-wrap gap-2">
                  {INTERESTS_LIST.map(tag => (
                    <button
                      type="button"
                      key={tag}
                      onClick={e => {
                        e.preventDefault();
                        if (interests.includes(tag)) {
                          setInterests(interests.filter(i => i !== tag));
                        } else if (interests.length < 5) {
                          setInterests([...interests, tag]);
                        } else {
                          showToast("error", "Maximum 5 interests allowed.");
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                        interests.includes(tag)
                          ? "bg-gradient-to-r from-[#0bb] to-[#14639d] text-white shadow-neonBtn scale-105"
                          : "bg-[#1a2b46] border border-[#0bb] text-[#559] hover:bg-[#0bb]/30 hover:border-[#0bb] hover:text-white hover:shadow-neonBtn"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-[#559]">Selected: {interests.length} / 5</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#559] mb-2">Profile Image (Optional)</label>
              <div className="relative">
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => setImage(e.target.files[0])}
                />
                <label htmlFor="profile-image-upload"
                  className="cursor-pointer flex items-center gap-3 px-4 py-4 rounded-3xl border border-[#0bb] border-dashed bg-[#172133] text-[#0bb] hover:bg-[#0bb]/10 transition select-none"
                >
                  <Upload className="w-5 h-5" />
                  {image ? image.name : "Choose Profile Image"}
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className="w-full py-4 rounded-3xl bg-gradient-to-r from-[#0bb] to-[#14639d] text-black font-bold shadow-neonBtn text-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {sendingOtp ? (
                <div className="flex justify-center items-center gap-3">
                  <div className="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin" />
                  Signing Up...
                </div>
              ) : "Sign Up"}
            </button>

            {otpSent && (
              <div className="mt-8 pt-6 border-t border-[#0bb]">
                <h2 className="text-center text-2xl font-semibold text-[#0bb] mb-2">Verify Your Email</h2>
                <p className="text-[#559] text-center mb-4">Enter the OTP sent to your email</p>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full text-center tracking-widest text-xl px-6 py-4 rounded-3xl bg-[#172133] border border-[#0bb] text-[#0bb] placeholder-[#0bb]/50 focus:outline-none focus:ring-2 focus:ring-[#0bb]"
                />
                <button
                  onClick={handleOtpVerify}
                  disabled={verifyingOtp}
                  className="mt-6 w-full py-4 rounded-3xl bg-gradient-to-r from-green-500 to-green-700 text-white font-bold text-lg shadow-neonBtn hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                >
                  {verifyingOtp ? (
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </div>
                  ) : "Verify & Complete Registration"}
                </button>
              </div>
            )}

            <div className="mt-8 text-center text-[#559]">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-[#0bb] hover:text-[#14639d] font-semibold underline">
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
