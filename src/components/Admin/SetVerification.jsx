import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { isAdminTokenValid } from "../Auth/adminAuth";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/images/user.png";
import verifiedIcon from "../../assets/images/verified.svg";
import {
  CheckCircle,
  Search,
  Filter,
  Crown,
  Shield,
  ShieldOff,
  Users,
  Mail,
  Calendar,
  Star,
  Award,
  UserCheck,
  UserX,
  Loader,
} from "lucide-react";

const SetVerification = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminTokenValid()) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/getAllUsers", {
        headers: { Authorization: localStorage.getItem("adminToken") },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      showToast("error", "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (userId, currentStatus) => {
    const nextStatus = !currentStatus;
    const user = users.find((u) => u._id === userId);

    if (
      !window.confirm(
        `Are you sure you want to ${nextStatus ? "verify" : "unverify"} @${
          user?.username
        }?`
      )
    ) {
      return;
    }

    try {
      setActionLoading(userId);

      // Optimistic update
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === userId ? { ...u, isVerified: nextStatus } : u
        )
      );

      await axios.patch(
        `/admin/toggle-verify/${userId}`,
        { verify: nextStatus },
        {
          headers: { Authorization: localStorage.getItem("adminToken") },
        }
      );

      showToast("success", `User ${nextStatus ? "verified" : "unverified"} successfully!`);
    } catch (err) {
      console.error("❌ Failed to update verification status:", err);
      showToast("error", "Failed to update verification status");

      // Revert optimistic update
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === userId ? { ...u, isVerified: currentStatus } : u
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "banned" && user.isbanned?.status) ||
      (statusFilter === "active" && !user.isbanned?.status);

    const matchesVerification =
      verificationFilter === "all" ||
      (verificationFilter === "verified" && user.isVerified) ||
      (verificationFilter === "unverified" && !user.isVerified);

    return matchesSearch && matchesStatus && matchesVerification;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4 flex items-center justify-center">
        <div className="max-w-7xl w-full mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-12 shadow-2xl backdrop-blur-md text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-100">
                User Verification Management
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Manage user verification badges and trusted status
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
              <input
                type="text"
                placeholder="Search by username, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 text-sm sm:text-base"
              />
            </div>

            <div className="flex gap-4 flex-wrap sm:flex-nowrap">
              <div className="relative group flex-grow sm:flex-grow-0 min-w-[140px]">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-8 py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 appearance-none cursor-pointer text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="banned">Banned</option>
                </select>
              </div>

              <div className="relative group flex-grow sm:flex-grow-0 min-w-[160px]">
                <Crown className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="w-full pl-12 pr-8 py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 appearance-none cursor-pointer text-sm sm:text-base"
                >
                  <option value="all">All Users</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 text-sm sm:text-base">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-blue-300">{users.length}</p>
                  <p className="text-blue-400">Total Users</p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-green-300">
                    {users.filter((user) => user.isVerified).length}
                  </p>
                  <p className="text-green-400">Verified Users</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-500/10 border border-gray-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <UserX className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-gray-300">
                    {users.filter((user) => !user.isVerified).length}
                  </p>
                  <p className="text-gray-400">Unverified</p>
                </div>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-red-300">
                    {users.filter((user) => user.isbanned?.status).length}
                  </p>
                  <p className="text-red-400">Banned Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-6 bg-gray-700/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No users found</h3>
              <p className="text-gray-400 text-base max-w-md mx-auto px-4">
                {searchTerm || statusFilter !== "all" || verificationFilter !== "all"
                  ? "Try adjusting your search filters"
                  : "No users available"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user, index) => (
                <div
                  key={user._id}
                  className="group bg-gray-700 border border-gray-600 rounded-2xl p-6 hover:bg-gray-600 hover:border-gray-500 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-green-500/10 relative flex flex-col lg:flex-row lg:items-center gap-6"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: "fadeInUp 0.5s ease-out forwards",
                  }}
                >
                  {/* Loading overlay */}
                  {actionLoading === user._id && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
                      <div className="bg-gray-800 border border-gray-600 rounded-xl px-4 py-2 flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin text-cyan-400" />
                        <span className="text-white text-sm">Updating...</span>
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-500 group-hover:border-green-400 transition-colors duration-300">
                        <img
                          src={user.profileImageURL || defaultAvatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {user.isVerified && (
                        <div className="absolute -bottom-1 -right-1 p-1 bg-green-500 rounded-full">
                          <Crown className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base sm:text-lg font-bold text-gray-100 group-hover:text-green-400 transition-colors duration-300 truncate">
                          @{user.username}
                        </h3>
                        {user.isVerified && (
                          <img src={verifiedIcon} alt="Verified" className="w-5 h-5" />
                        )}
                      </div>
                      <p className="text-gray-300 font-medium truncate text-sm sm:text-base">
                        {user.name}
                      </p>
                    </div>
                  </div>

                  {/* Contact & Status Info */}
                  <div className="flex-1 min-w-0 space-y-2 text-sm sm:text-base">
                    <div className="flex items-center gap-2 text-gray-400 truncate">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {/* Ban Status */}
                      <div
                        className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 truncate ${
                          user.isbanned?.status
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-green-500/20 text-green-300 border border-green-500/30"
                        }`}
                      >
                        {user.isbanned?.status ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <UserCheck className="w-3 h-3" />
                        )}
                        <span className="truncate">
                          {user.isbanned?.status ? "BANNED" : "ACTIVE"}
                        </span>
                      </div>

                      {/* Verification Status */}
                      <div
                        className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 truncate ${
                          user.isVerified
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                        }`}
                      >
                        {user.isVerified ? (
                          <Award className="w-3 h-3" />
                        ) : (
                          <Star className="w-3 h-3" />
                        )}
                        <span className="truncate">
                          {user.isVerified ? "VERIFIED" : "UNVERIFIED"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-4 mt-4 lg:mt-0 min-w-[180px] justify-start sm:justify-end">
                    <button
                      onClick={() => toggleVerification(user._id, user.isVerified)}
                      disabled={actionLoading === user._id}
                      className={`flex-1 sm:flex-none min-w-0 px-4 sm:px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 text-center text-sm sm:text-base ${
                        user.isVerified
                          ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white"
                          : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white"
                      } ${actionLoading === user._id ? "opacity-50 cursor-not-allowed" : ""}`}
                      style={{ whiteSpace: "normal" }} // Allow wrap on small widths
                    >
                      {actionLoading === user._id ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>...</span>
                        </>
                      ) : (
                        <>
                          {user.isVerified ? (
                            <ShieldOff className="w-4 h-4" />
                          ) : (
                            <Award className="w-4 h-4" />
                          )}
                          <span className="break-words">
                            {user.isVerified ? "Remove Verification" : "Set Verified"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Toast Notifications */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 duration-300 max-w-xs sm:max-w-sm">
            <div
              className={`px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md break-words ${
                toast.type === "success"
                  ? "bg-green-800/90 border-green-600 text-green-100"
                  : "bg-red-800/90 border-red-600 text-red-100"
              }`}
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    toast.type === "success" ? "bg-green-400" : "bg-red-400"
                  } animate-pulse`}
                ></div>
                <span className="font-medium text-sm">{toast.message}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animation Styles */}
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
};

export default SetVerification;
