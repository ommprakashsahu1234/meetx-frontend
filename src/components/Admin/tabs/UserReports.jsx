import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import defaultAvatar from "../../../assets/images/user.png";
import verifiedIcon from "../../../assets/images/verified.svg";
import { useAdmin } from "../../Auth/AdminContext";
import { 
  Flag, 
  User, 
  X, 
  AlertTriangle, 
  Eye, 
  Calendar,
  MessageSquare,
  Users,
  Search,
  Filter
} from "lucide-react";

function UserReports() {
  const { admin } = useAdmin();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("reportCount");

  useEffect(() => {
    const fetchReportedUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/admin/reported-users", {
          headers: { Authorization: `Bearer ${admin?.token}` },
        });
        console.log("✅ Reported Users Response:", res.data);
        setUsers(res.data || []);
      } catch (err) {
        console.error("❌ Error fetching reported users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportedUsers();
  }, [admin?.token]);

  const openUserModal = async (user) => {
    setSelectedUser(user);
    try {
      const res = await axios.get(`/admin/get-user-reports/${user._id}`, {
        headers: { Authorization: `Bearer ${admin?.token}` },
      });
      setUserReports(res.data.reports || []);
    } catch (err) {
      console.error("❌ Error loading user reports:", err);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserReports([]);
  };

  const filteredUsers = users
    .filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.profile && user.profile.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "reportCount") return b.reportCount - a.reportCount;
      if (sortBy === "username") return a.username.localeCompare(b.username);
      return 0;
    });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-12 shadow-2xl backdrop-blur-md text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading reported users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl">
            <Flag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Reported Users</h1>
            <p className="text-gray-400">Review and manage user reports</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
            />
          </div>
          
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-12 pr-8 py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="reportCount">Sort by Reports</option>
              <option value="username">Sort by Username</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-red-300">{users.length}</p>
                <p className="text-red-400 text-sm">Reported Users</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Flag className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-orange-300">
                  {users.reduce((sum, user) => sum + user.reportCount, 0)}
                </p>
                <p className="text-orange-400 text-sm">Total Reports</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-yellow-300">
                  {users.filter(user => user.reportCount >= 5).length}
                </p>
                <p className="text-yellow-400 text-sm">High Priority</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-6 bg-gray-700/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No reported users found</h3>
            <p className="text-gray-400 text-lg">
              {searchTerm ? "Try adjusting your search terms" : "No users have been reported yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user, index) => (
              <div
                key={user._id || index}
                className="group bg-gray-700 border border-gray-600 rounded-2xl p-6 cursor-pointer hover:bg-gray-600 hover:border-gray-500 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/10"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards'
                }}
                onClick={() => openUserModal(user)}
              >
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-500 group-hover:border-red-400 transition-colors duration-300 mx-auto">
                      <img
                        src={user.profileImageURL || defaultAvatar}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {user.reportCount >= 5 && (
                      <div className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <p className="font-semibold text-gray-100 group-hover:text-cyan-400 transition-colors duration-300 truncate">
                      @{user.username}
                    </p>
                    {user.isVerified && (
                      <img
                        src={verifiedIcon}
                        alt="Verified"
                        className="w-4 h-4"
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <Flag className="w-4 h-4 text-red-400" />
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      user.reportCount >= 10
                        ? "bg-red-500/20 text-red-300"
                        : user.reportCount >= 5
                        ? "bg-orange-500/20 text-orange-300"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}>
                      {user.reportCount} Report{user.reportCount > 1 ? "s" : ""}
                    </span>
                  </div>
                  
                  {user.profile && (
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {user.profile}
                    </p>
                  )}
                  
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">Click to view reports</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-100">User Reports</h3>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors duration-300 group"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-600">
                  <img
                    src={selectedUser.profileImageURL || defaultAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xl font-semibold text-gray-100">
                      @{selectedUser.username}
                    </h4>
                    {selectedUser.isVerified && (
                      <img
                        src={verifiedIcon}
                        alt="Verified"
                        className="w-5 h-5"
                      />
                    )}
                  </div>
                  {selectedUser.profile && (
                    <p className="text-gray-400 mb-2">{selectedUser.profile}</p>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Flag className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-300 font-medium">
                        {selectedUser.reportCount} Reports
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <h5 className="text-lg font-semibold text-gray-100">
                  Reports ({userReports.length})
                </h5>
              </div>
              
              {userReports.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No reports available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userReports.map((report, index) => (
                    <div
                      key={index}
                      className="bg-gray-700 border border-gray-600 rounded-2xl p-4 hover:bg-gray-600 transition-colors duration-300"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.5s ease-out forwards'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-500 flex-shrink-0">
                          <img
                            src={report.reporterId?.profileImageURL || defaultAvatar}
                            alt="Reporter"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-100">
                                @{report.reporterId?.username || "Unknown"}
                              </span>
                              {report.reporterId?.isVerified && (
                                <img
                                  src={verifiedIcon}
                                  alt="Verified"
                                  className="w-4 h-4"
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(report.createdAt)}</span>
                            </div>
                          </div>
                          <p className="text-gray-300 leading-relaxed break-words">
                            {report.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
}

export default UserReports;
