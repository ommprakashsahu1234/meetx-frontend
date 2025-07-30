import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import defaultAvatar from "../../../assets/images/user.png";
import verifiedIcon from "../../../assets/images/verified.svg";
import { useAdmin } from "../../Auth/AdminContext";
import { 
  FileText, 
  Flag, 
  X, 
  AlertTriangle, 
  Eye, 
  Calendar,
  MessageSquare,
  Shield,
  ShieldOff,
  Search,
  Filter,
  Image as ImageIcon,
  Play,
  MapPin,
  User,
  CheckCircle,
  XCircle
} from "lucide-react";

function PostReports() {
  const { admin } = useAdmin();
  const [reports, setReports] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postReports, setPostReports] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const fetchReportedPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/reported-posts");
      setReports(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching reported posts:", err.response?.data || err.message);
      showToast("error", "Failed to fetch reported posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportedPosts();
  }, []);

  const handleSuspendPost = async (postId) => {
    if (!window.confirm("Suspend this post?")) return;

    try {
      setActionLoading(postId);
      setReports((prev) =>
        prev.map((item) =>
          item.post._id === postId
            ? { ...item, post: { ...item.post, suspended: true } }
            : item
        )
      );
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(prev => ({ ...prev, suspended: true }));
      }
      await axios.patch(`/admin/suspend-post/${postId}`, null, {
        headers: { Authorization: `Bearer ${admin?.token}` },
      });
      showToast("success", "Post Suspended!");
      await fetchReportedPosts();
    } catch (err) {
      console.error("Failed to suspend post:", err);
      showToast("error", "Failed to Suspend Post");
      setReports((prev) =>
        prev.map((item) =>
          item.post._id === postId
            ? { ...item, post: { ...item.post, suspended: false } }
            : item
        )
      );
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(prev => ({ ...prev, suspended: false }));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsuspendPost = async (postId) => {
    if (!window.confirm("Unsuspend this post?")) return;

    try {
      setActionLoading(postId);
      setReports((prev) =>
        prev.map((item) =>
          item.post._id === postId
            ? { ...item, post: { ...item.post, suspended: false } }
            : item
        )
      );
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(prev => ({ ...prev, suspended: false }));
      }
      await axios.patch(`/admin/unsuspend-post/${postId}`, null, {
        headers: { Authorization: `Bearer ${admin?.token}` },
      });
      showToast("success", "Post Unsuspended!");
      await fetchReportedPosts();
    } catch (err) {
      console.error("Failed to unsuspend post:", err);
      showToast("error", "Failed to Unsuspend Post");
      setReports((prev) =>
        prev.map((item) =>
          item.post._id === postId
            ? { ...item, post: { ...item.post, suspended: true } }
            : item
        )
      );
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(prev => ({ ...prev, suspended: true }));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const openPostModal = async (post) => {
    setSelectedPost(post);
    try {
      const res = await axios.get(`/admin/get-reports/${post._id}`);
      setPostReports(res.data.reports || []);
    } catch (error) {
      console.error("Failed to load post reports:", error);
      showToast("error", "Failed to load post reports");
    }
  };

  const closeModal = () => {
    setSelectedPost(null);
    setPostReports([]);
  };

  const filteredReports = reports.filter(({ post, count }) => {
    const matchesSearch = post.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.userId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
                          (statusFilter === "suspended" && post.suspended) ||
                          (statusFilter === "active" && !post.suspended);

    return matchesSearch && matchesStatus;
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
            <p className="text-gray-300 text-lg sm:text-xl">Loading reported posts...</p>
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
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100">Reported Posts</h1>
            <p className="text-gray-400 text-sm sm:text-base">Review and moderate reported content</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 sm:py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 text-sm sm:text-base"
            />
          </div>

          <div className="relative group min-w-[150px]">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-12 pr-8 py-2 sm:py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 appearance-none cursor-pointer text-sm sm:text-base"
            >
              <option value="all">All Posts</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 text-xs sm:text-sm">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Flag className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-red-300">{reports.length}</p>
                <p className="text-red-400">Reported Posts</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-orange-300">
                  {reports.reduce((sum, item) => sum + item.count, 0)}
                </p>
                <p className="text-orange-400">Total Reports</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-green-300">
                  {reports.filter(item => !item.post.suspended).length}
                </p>
                <p className="text-green-400">Active Posts</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-red-300">
                  {reports.filter(item => item.post.suspended).length}
                </p>
                <p className="text-red-400">Suspended</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-6 bg-gray-700/50 rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-300 mb-2">No reported posts found</h3>
            <p className="text-gray-400 text-base sm:text-lg">
              {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "No posts have been reported yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReports.map(({ post, count }, index) => (
              <div
                key={post._id}
                className="group bg-gray-700 border border-gray-600 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-600 hover:border-gray-500 transition duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/10 relative flex flex-col"
                style={{animationDelay: `${index * 50}ms`, animation: 'fadeInUp 0.5s ease-out forwards'}}
                onClick={() => openPostModal(post)}
              >
                {/* Loading overlay */}
                {actionLoading === post._id && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
                    <div className="bg-gray-800 border border-gray-600 rounded-xl px-4 py-2 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-white text-sm">Processing...</span>
                    </div>
                  </div>
                )}

                {/* Media */}
                <div className="relative aspect-square overflow-hidden flex-shrink-0">
                  {post.media[0]?.type === "image" ? (
                    <>
                      <img
                        src={post.media[0].url}
                        alt="Reported"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 p-2 bg-gray-900/70 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ImageIcon className="w-4 h-4 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <video
                        src={post.media[0].url}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        muted
                      />
                      <div className="absolute top-3 right-3 p-2 bg-gray-900/70 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    </>
                  )}

                  {/* Status indicator */}
                  <div className="absolute top-3 left-3">
                    <div className={`px-2 py-1 rounded-xl text-xs font-medium flex items-center gap-1 ${
                      post.suspended 
                        ? "bg-red-500/90 text-white backdrop-blur-sm" 
                        : "bg-green-500/90 text-white backdrop-blur-sm"
                    }`}>
                      {post.suspended ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {post.suspended ? "SUSPENDED" : "ACTIVE"}
                    </div>
                  </div>

                  {/* Reports count */}
                  <div className="absolute bottom-3 right-3">
                    <div className="bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-xl text-xs font-medium flex items-center gap-1">
                      <Flag className="w-3 h-3" />
                      {count}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  {post.caption && (
                    <p className="text-gray-300 text-sm sm:text-base line-clamp-2 leading-relaxed mb-3 break-words">
                      {post.caption}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-1 truncate">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">Author: {post.userId?.slice(-6) || 'Unknown'}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className={`w-full py-2 px-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 mt-auto ${
                      post.suspended
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white"
                        : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white"
                    } ${actionLoading === post._id ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      post.suspended
                        ? handleUnsuspendPost(post._id)
                        : handleSuspendPost(post._id);
                    }}
                    disabled={actionLoading === post._id}
                    type="button"
                  >
                    {actionLoading === post._id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>...</span>
                      </>
                    ) : (
                      <>
                        {post.suspended ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                        {post.suspended ? "Unsuspend" : "Suspend"} Post
                      </>
                    )}
                  </button>

                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400 select-none">
                    <Eye className="w-4 h-4" />
                    <span>Click to view details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-100">Post Details</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                      selectedPost.suspended 
                        ? "bg-red-500/20 text-red-300 border border-red-500/30" 
                        : "bg-green-500/20 text-green-300 border border-green-500/30"
                    }`}>
                      {selectedPost.suspended ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {selectedPost.suspended ? "SUSPENDED" : "ACTIVE"}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors duration-300 group"
                aria-label="Close modal"
                type="button"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
              </button>
            </div>

            {/* Media Section */}
            <div className="relative bg-black max-h-[50vh] overflow-hidden flex justify-center items-center">
              {selectedPost.media[0]?.type === "image" ? (
                <img
                  src={selectedPost.media[0].url}
                  alt="Post"
                  className="max-w-full max-h-[50vh] object-contain select-none"
                  draggable={false}
                />
              ) : (
                <video
                  src={selectedPost.media[0].url}
                  controls
                  className="max-w-full max-h-[50vh] object-contain select-none"
                  draggable={false}
                />
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Post Info */}
              {selectedPost.caption && (
                <div className="mb-4">
                  <p className="text-lg sm:text-xl text-gray-100 leading-relaxed break-words">
                    {selectedPost.caption}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedPost.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPost.tags.map((tag) => (
                    <a
                      key={tag._id}
                      href={`/user/${tag.username}`}
                      className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 text-sm font-medium hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300 truncate"
                      title={`@${tag.username}`}
                    >
                      @{tag.username}
                    </a>
                  ))}
                </div>
              )}

              {/* Location */}
              {selectedPost.location && (
                <div className="flex items-center gap-2 text-gray-400 mb-4 text-sm sm:text-base">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedPost.location}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="mb-6">
                <button
                  className={`w-full md:w-auto px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 justify-center ${
                    selectedPost.suspended
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white"
                      : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white"
                  } ${actionLoading === selectedPost._id ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    selectedPost.suspended
                      ? handleUnsuspendPost(selectedPost._id)
                      : handleSuspendPost(selectedPost._id);
                  }}
                  disabled={actionLoading === selectedPost._id}
                  type="button"
                >
                  {actionLoading === selectedPost._id ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {selectedPost.suspended ? <Shield className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
                      {selectedPost.suspended ? "Unsuspend Post" : "Suspend Post"}
                    </>
                  )}
                </button>
              </div>

              {/* Reports Section */}
              <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-100">
                  <MessageSquare className="w-5 h-5" />
                  <span>Reports ({postReports.length})</span>
                </div>

                {postReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3" />
                    <p>No reports available</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                    {postReports.map((report, index) => (
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
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-medium text-gray-100 truncate">
                                  @{report.reporterId?.username || "Unknown"}
                                </span>
                                {report.reporterId?.isVerified && (
                                  <img src={verifiedIcon} alt="Verified" className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(report.createdAt)}</span>
                              </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed break-words text-sm sm:text-base">
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
        </div>
      )}

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
                toast.type === "success" ? "bg-green-400" : "bg-red-400"
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
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
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

export default PostReports;
