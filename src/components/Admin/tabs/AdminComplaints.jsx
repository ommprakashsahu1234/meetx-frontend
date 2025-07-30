import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { useAdmin } from "../../Auth/AdminContext";
import defaultAvatar from "../../../assets/images/user.png";
import verifiedIcon from "../../../assets/images/verified.svg";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Activity,
  Tag,
  Loader,
  MessageCircle,
  RotateCcw,
  Save,
  Eye,
} from "lucide-react";

function AdminComplaints() {
  const { admin } = useAdmin();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/admin/all-complaints", {
        headers: { Authorization: `Bearer ${admin?.token}` },
      });
      setComplaints(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching complaints:", err);
      showToast("error", "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id, field, value) => {
    setUpdates((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const getCurrentValue = (complaint, field) => {
    return updates[complaint._id]?.[field] !== undefined 
      ? updates[complaint._id][field] 
      : complaint[field] || "";
  };

  const hasChanges = (complaint) => {
    const currentUpdates = updates[complaint._id];
    if (!currentUpdates) return false;
    
    return (
      (currentUpdates.status && currentUpdates.status !== complaint.status) ||
      (currentUpdates.response !== undefined && currentUpdates.response !== (complaint.response || ""))
    );
  };

  const handleUpdate = async (id) => {
    const complaint = complaints.find(c => c._id === id);
    if (!complaint) return;

    if (!hasChanges(complaint)) {
      showToast("info", "No changes to save");
      return;
    }

    const currentUpdates = updates[id] || {};
    const { response = complaint.response || "", status = complaint.status } = currentUpdates;

    try {
      setActionLoading(id);

      setComplaints(prev => 
        prev.map(c => 
          c._id === id 
            ? { ...c, response, status }
            : c
        )
      );

      await axios.put(
        `/admin/update-complaint/${id}`,
        { response, status },
        {
          headers: { Authorization: `Bearer ${admin?.token}` },
        }
      );

      showToast("success", "Complaint updated successfully!");
      
      setUpdates((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      await fetchComplaints();
    } catch (err) {
      console.error("❌ Error updating complaint:", err);
      showToast("error", "Failed to update complaint");
      await fetchComplaints();
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        color: "text-blue-300",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
        icon: Activity,
        label: "ACTIVE"
      },
      pending: {
        color: "text-yellow-300",
        bgColor: "bg-yellow-500/20",
        borderColor: "border-yellow-500/30",
        icon: Clock,
        label: "PENDING"
      },
      completed: {
        color: "text-green-300",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500/30",
        icon: CheckCircle,
        label: "COMPLETED"
      }
    };
    return configs[status] || configs.active;
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    
    return (
      <div className={`${config.bgColor} ${config.borderColor} border rounded-xl px-3 py-1 flex items-center gap-2`}>
        <Icon className={`w-3 h-3 ${config.color}`} />
        <span className={`text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>
    );
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.issueType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    const matchesType = typeFilter === "all" || complaint.issueType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const uniqueIssueTypes = [...new Set(complaints.map(c => c.issueType).filter(Boolean))];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-10 sm:p-12 shadow-2xl backdrop-blur-md text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg sm:text-xl">Loading complaints...</p>
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
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100">User Complaints</h1>
            <p className="text-gray-400 text-sm sm:text-base">Handle and respond to user complaints</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
            <input
              type="text"
              placeholder="Search by username, issue type, or description..."
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
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="relative group min-w-[180px] flex-1 sm:flex-none">
              <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-12 pr-8 py-2 sm:py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 appearance-none cursor-pointer text-sm sm:text-base"
              >
                <option value="all">All Types</option>
                {uniqueIssueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 text-xs sm:text-sm">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-blue-300">{complaints.length}</p>
                <p className="text-blue-400">Total Complaints</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-yellow-300">
                  {complaints.filter(c => c.status === "pending").length}
                </p>
                <p className="text-yellow-400">Pending</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-blue-300">
                  {complaints.filter(c => c.status === "active").length}
                </p>
                <p className="text-blue-400">Active</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-300">
                  {complaints.filter(c => c.status === "completed").length}
                </p>
                <p className="text-green-400">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-6 bg-gray-700/50 rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-300 mb-2">No complaints found</h3>
            <p className="text-gray-400 text-base sm:text-lg">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                ? "Try adjusting your search filters" 
                : "No complaints have been submitted yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredComplaints.map((complaint, index) => (
              <div
                key={complaint._id}
                className="group bg-gray-700 border border-gray-600 rounded-2xl p-4 sm:p-6 hover:bg-gray-600 hover:border-gray-500 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-green-500/10 relative"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards'
                }}
              >
                {/* Loading overlay */}
                {actionLoading === complaint._id && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
                    <div className="bg-gray-800 border border-gray-600 rounded-xl px-4 py-2 flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin text-cyan-400" />
                      <span className="text-white text-sm">Updating...</span>
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-gray-500 group-hover:border-green-400 transition-colors duration-300">
                      <img
                        src={complaint.userId?.profileImageURL || defaultAvatar}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <h3 className="font-bold text-gray-100 group-hover:text-green-400 transition-colors duration-300 truncate">
                          @{complaint.userId?.username || "Unknown User"}
                        </h3>
                        {complaint.userId?.isVerified && (
                          <img src={verifiedIcon} alt="Verified" className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">
                        ID: {complaint._id.slice(-8)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {getStatusBadge(getCurrentValue(complaint, "status"))}
                    {hasChanges(complaint) && (
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl px-3 py-1 flex items-center gap-2">
                        <Eye className="w-3 h-3 text-blue-400" />
                        <span className="text-xs font-medium text-blue-300">
                          MODIFIED
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Complaint Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6 text-sm sm:text-base">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Tag className="w-4 h-4 flex-shrink-0" />
                    <span>Type:</span>
                    <span className="font-medium text-cyan-300 truncate">{complaint.issueType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>Date:</span>
                    <span className="font-medium text-gray-300">{formatDate(complaint.createdAt)}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3 text-gray-400 text-sm sm:text-base">
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <h4 className="font-medium">Description:</h4>
                  </div>
                  <div className="bg-gray-800 border border-gray-600 rounded-2xl p-4 text-gray-100 leading-relaxed whitespace-pre-wrap break-words text-sm sm:text-base max-h-48 overflow-y-auto">
                    {complaint.description}
                  </div>
                </div>

                {/* Status Update */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    Status:
                  </label>
                  <select
                    className={`w-full sm:w-auto px-4 py-3 bg-gray-700 border-2 rounded-2xl text-gray-100 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 ${
                      hasChanges(complaint) ? "border-cyan-500" : "border-gray-600"
                    } text-sm sm:text-base`}
                    value={getCurrentValue(complaint, "status")}
                    onChange={(e) => handleChange(complaint._id, "status", e.target.value)}
                    disabled={actionLoading === complaint._id}
                  >
                    <option value="active" disabled={getCurrentValue(complaint, "status") !== "active"}>
                      Active
                    </option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Admin Response */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    Admin Response:
                  </label>
                  <textarea
                    rows="4"
                    className={`w-full px-4 py-3 bg-gray-700 border-2 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 resize-y text-sm sm:text-base ${
                      hasChanges(complaint) ? "border-cyan-500" : "border-gray-600"
                    } max-h-48`}
                    placeholder="Enter your response to this complaint..."
                    value={getCurrentValue(complaint, "response")}
                    onChange={(e) => handleChange(complaint._id, "response", e.target.value)}
                    disabled={actionLoading === complaint._id}
                  />
                  {complaint.response && !updates[complaint._id]?.response && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>Last updated: {formatDateTime(complaint.updatedAt)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex gap-3 flex-wrap w-full sm:w-auto">
                    <button
                      onClick={() => handleUpdate(complaint._id)}
                      className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 text-sm sm:text-base ${
                        hasChanges(complaint)
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
                          : "bg-gray-600 text-gray-400 cursor-not-allowed"
                      } ${actionLoading === complaint._id ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={!hasChanges(complaint) || actionLoading === complaint._id}
                      type="button"
                    >
                      {actionLoading === complaint._id ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                    
                    {hasChanges(complaint) && (
                      <button
                        onClick={() => {
                          setUpdates(prev => {
                            const updated = { ...prev };
                            delete updated[complaint._id];
                            return updated;
                          });
                        }}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl font-semibold bg-gray-600 hover:bg-gray-500 text-gray-100 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 text-sm sm:text-base"
                        disabled={actionLoading === complaint._id}
                        type="button"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                  
                  {hasChanges(complaint) && (
                    <div className="flex items-center gap-2 text-sm text-cyan-400 mt-2 sm:mt-0">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Unsaved changes</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {toast && (
        <div className="fixed top-6 right-4 sm:right-6 z-50 animate-in slide-in-from-top-2 duration-300 max-w-xs sm:max-w-sm">
          <div
            className={`px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
              toast.type === "success" 
                ? "bg-green-800/90 border-green-600 text-green-100" 
                : toast.type === "error"
                ? "bg-red-800/90 border-red-600 text-red-100"
                : "bg-blue-800/90 border-blue-600 text-blue-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                toast.type === "success" ? "bg-green-400" : 
                toast.type === "error" ? "bg-red-400" : "bg-blue-400"
              } animate-pulse`}></div>
              <span className="font-medium text-sm truncate">{toast.message}</span>
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
}

export default AdminComplaints;
