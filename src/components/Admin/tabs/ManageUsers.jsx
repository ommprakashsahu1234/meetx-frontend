import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import VerifiedIcon from "../../../assets/images/verified.svg";
import defaultAvatar from "../../../assets/images/user.png";
import { 
  Users, 
  Search, 
  Filter, 
  Shield, 
  ShieldOff, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  Calendar,
  AlertTriangle,
  Crown,
  X
} from "lucide-react";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      const res = await axios.get("/admin/getAllUsers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const usersWithDefaults = (res.data.users || []).map((user) => ({
        ...user,
        isbanned: user.isbanned || { banned: false, reason: null },
      }));

      setUsers(usersWithDefaults);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (id, isCurrentlyBanned) => {
    if (!isCurrentlyBanned) {
      const user = users.find((u) => u._id === id);
      setSelectedUser(user);
      setBanModalOpen(true);
      return;
    }

    if (!window.confirm("Are you sure you want to unban this user?")) return;

    try {
      setActionLoading(id);
      const token = localStorage.getItem("admin-token");

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id
            ? {
                ...user,
                isbanned: {
                  banned: false,
                  reason: null,
                },
              }
            : user
        )
      );

      await axios.post(`/admin/unban/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchUsers();
    } catch (err) {
      console.error("Unban failed", err);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id
            ? {
                ...user,
                isbanned: {
                  banned: true,
                  reason: user.isbanned?.reason || null,
                },
              }
            : user
        )
      );
      alert("Failed to unban user. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanSubmit = async () => {
    if (!banReason.trim()) {
      alert("Ban reason is required.");
      return;
    }

    try {
      setActionLoading(selectedUser._id);
      const token = localStorage.getItem("admin-token");

      // Optimistic update
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === selectedUser._id
            ? {
                ...user,
                isbanned: {
                  banned: true,
                  reason: banReason.trim(),
                },
              }
            : user
        )
      );

      await axios.post(
        `/admin/ban/${selectedUser._id}`,
        { reason: banReason.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBanModalOpen(false);
      setBanReason("");
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      console.error("Ban failed", err);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === selectedUser._id
            ? {
                ...user,
                isbanned: {
                  banned: false,
                  reason: null,
                },
              }
            : user
        )
      );
      alert("Failed to ban user. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("admin-token");

    if (!token) {
      navigate("/admin");
      return;
    }

    fetchUsers();
  }, [navigate]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "banned" && user.isbanned?.banned) ||
      (statusFilter === "active" && !user.isbanned?.banned);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-10 sm:p-12 shadow-2xl backdrop-blur-md text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg sm:text-xl">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100">Manage Users</h1>
            <p className="text-gray-400 text-sm sm:text-base">View and manage all platform users</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
            <input
              type="text"
              placeholder="Search users by username, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 sm:py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 text-sm sm:text-base"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="relative group min-w-[140px] flex-1 sm:flex-none">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-8 py-2 sm:py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 appearance-none cursor-pointer text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
            </div>

            <div className="relative group min-w-[160px] flex-1 sm:flex-none">
              <Crown className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="w-full pl-12 pr-8 py-2 sm:py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 appearance-none cursor-pointer text-sm sm:text-base"
              >
                <option value="all">All Users</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 text-xs sm:text-sm">
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
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-green-300">
                  {users.filter((user) => !user.isbanned?.banned).length}
                </p>
                <p className="text-green-400">Active Users</p>
              </div>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-red-300">
                  {users.filter((user) => user.isbanned?.banned).length}
                </p>
                <p className="text-red-400">Banned Users</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-purple-300">
                  {users.filter((user) => user.isVerified).length}
                </p>
                <p className="text-purple-400">Verified Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-6 bg-gray-700/50 rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-300 mb-2">No users found</h3>
            <p className="text-gray-400 text-base sm:text-lg">
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
                className="group bg-gray-700 border border-gray-600 rounded-2xl p-4 sm:p-6 hover:bg-gray-600 hover:border-gray-500 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-purple-500/10"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: "fadeInUp 0.5s ease-out forwards",
                }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                  {/* User Avatar and Basic Info */}
                  <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-gray-500 group-hover:border-purple-400 transition-colors duration-300">
                        <img
                          src={user.profileImageURL || defaultAvatar}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {user.isVerified && (
                        <div className="absolute -bottom-1 -right-1 p-1 bg-purple-500 rounded-full">
                          <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2 mb-0.5">
                        <h3 className="text-base sm:text-lg font-bold text-gray-100 group-hover:text-purple-400 transition-colors duration-300 truncate">
                          {user.username}
                        </h3>
                        {user.isVerified && (
                          <img src={VerifiedIcon} alt="verified" className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>
                      <p className="text-gray-300 font-medium truncate text-sm sm:text-base">{user.name}</p>

                      {/* Ban reason */}
                      {user.isbanned?.banned && user.isbanned?.reason && (
                        <div className="mt-1 sm:mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm sm:text-base">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <p className="text-red-300 truncate">
                              <span className="font-medium">Banned:</span> {user.isbanned.reason}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0 space-y-1 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate block">{user.email}</span>
                    </div>
                    {user.mobile && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate block">{user.mobile}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 min-w-[140px]">
                    {/* Status Badge */}
                    <div
                      className={`px-3 py-1 rounded-xl text-sm font-medium flex items-center gap-2 whitespace-nowrap ${
                        user.isbanned?.banned
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-green-500/20 text-green-300 border border-green-500/30"
                      }`}
                    >
                      {user.isbanned?.banned ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {user.isbanned?.banned ? "BANNED" : "ACTIVE"}
                    </div>

                    {/* Action Button */}
                    <button
                      className={`w-full sm:w-auto px-5 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base ${
                        user.isbanned?.banned
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white"
                          : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white"
                      } ${actionLoading === user._id ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBan(user._id, user.isbanned?.banned);
                      }}
                      disabled={actionLoading === user._id}
                      type="button"
                    >
                      {actionLoading === user._id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>...</span>
                        </>
                      ) : (
                        <>
                          {user.isbanned?.banned ? (
                            <Shield className="w-4 h-4" />
                          ) : (
                            <ShieldOff className="w-4 h-4" />
                          )}
                          {user.isbanned?.banned ? "Unban User" : "Ban User"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {banModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
                    <ShieldOff className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-100">Ban User</h3>
                </div>
                <button
                  onClick={() => {
                    setBanModalOpen(false);
                    setBanReason("");
                    setSelectedUser(null);
                  }}
                  className="p-2 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors duration-300"
                  type="button"
                  aria-label="Close ban modal"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600">
                  <img
                    src={selectedUser.profileImageURL || defaultAvatar}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-100 truncate">@{selectedUser.username}</h4>
                  <p className="text-gray-400 text-sm truncate">{selectedUser.name}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for banning (required)
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Please provide a clear reason for banning this user..."
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 resize-y min-h-[80px] max-h-44 text-sm sm:text-base"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>Be specific about the violation</span>
                  <span>{banReason.length}/500</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setBanModalOpen(false);
                    setBanReason("");
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700 text-gray-100 rounded-2xl hover:bg-gray-600 transition-colors duration-300 text-sm sm:text-base"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBanSubmit}
                  disabled={!banReason.trim() || actionLoading === selectedUser._id}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-400 hover:to-red-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                  type="button"
                >
                  {actionLoading === selectedUser._id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Banning...</span>
                    </>
                  ) : (
                    <>
                      <ShieldOff className="w-4 h-4" />
                      <span>Ban User</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animation Style */}
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
      `}</style>
    </div>
  );
};

export default ManageUsers;
