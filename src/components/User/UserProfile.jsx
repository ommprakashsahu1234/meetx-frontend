import React, { useEffect, useState, useRef } from "react";
import axios from "../utils/axios";
import { useNavigate, useParams } from "react-router-dom";
import defaultAvatar from "../../assets/images/user.png";
import verifiedIcon from "../../assets/images/verified.svg";
import {
  Heart,
  MessageCircle,
  Send,
  MapPin,
  Users,
  UserCheck,
  UserPlus,
  UserMinus,
  Flag,
  X,
  Grid3X3,
  ArrowLeft,
  MoreHorizontal,
  Image as ImageIcon,
  Play,
  User as UserIcon,
} from "lucide-react";

function UserProfile() {
  const { username } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [userData, setUserData] = useState(null);
  const [toast, setToast] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState("");
  const [reportPostModalOpen, setReportPostModalOpen] = useState(false);
  const [reportPostReason, setReportPostReason] = useState("");
  const [reportPostLoading, setReportPostLoading] = useState(false);

  const commentInputRef = useRef();
  const navigate = useNavigate();

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
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    const fetchData = async () => {
      try {
        const res = await axios.get(`/user/username/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = res.data.user;
        setUserData(user);

        const postsRes = await axios.get(`/post/user/${user._id}`);
        const postsWithCounts = await Promise.all(
          postsRes.data.posts.map(async (post) => {
            const [countRes] = await Promise.all([
              axios.get(`/post/${post._id}/comments/count`),
            ]);
            return {
              ...post,
              commentCount: countRes.data.count || 0,
            };
          })
        );

        setUserPosts(postsWithCounts || []);
      } catch (err) {
        console.error("User not found or error loading:", err);
        navigate("/");
      }
    };

    fetchData();
  }, [username, navigate]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get("/user/profile");
        setCurrentUserId(res.data.user._id);
        setLoggedInUsername(res.data.user.username);

        const isUserFollowing = userData?.followers?.includes(
          res.data.user._id
        );
        setIsFollowing(isUserFollowing);
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };

    if (userData) fetchCurrentUser();
  }, [userData]);

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`/post/${postId}/comments`);
      setComments(res.data.comments || []);
    } catch (error) {
      console.error("Failed to load comments", error);
      showToast("error", "Failed to Load Comments!");
    }
  };

  const handleOpenComments = async (post) => {
    try {
      setSelectedPost(post);
      await fetchComments(post._id);
      setCommentsModalOpen(true);
    } catch (error) {
      console.error("Failed to open comments", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(`/post/${selectedPost._id}/comment`, {
        text: newComment.trim(),
      });

      const updatedComments = await axios.get(
        `/post/${selectedPost._id}/comments`
      );
      setComments(updatedComments.data.comments || []);

      const countRes = await axios.get(
        `/post/${selectedPost._id}/comments/count`
      );
      setSelectedPost((prev) => ({
        ...prev,
        commentCount: countRes.data.count,
      }));

      setUserPosts((prev) =>
        prev.map((p) =>
          p._id === selectedPost._id
            ? { ...p, commentCount: countRes.data.count }
            : p
        )
      );

      setNewComment("");
      commentInputRef.current?.focus();
    } catch (error) {
      console.error("Error adding comment", error);
      showToast("error", "Failed to add comment");
    }
  };

  const disableRightClick = (e) => e.preventDefault();

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#172133] p-4 text-[#0bb] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400 border-t-transparent"></div>
          <p className="text-[#5599bb] text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#172133] p-4 text-[#0bb]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#0bb] hover:text-[#099] transition-colors duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-sm sm:text-base">Back</span>
          </button>
        </div>

        <div className="mb-8">
          <div className="bg-[#1a2b46] rounded-3xl p-8 shadow-subtleNeon border border-[#0bb] backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#0bb] shadow-neonBtn">
                  <img
                    src={userData.profileImageURL || defaultAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 p-3 bg-gradient-to-r from-[#0bb] to-[#14639d] rounded-full shadow-neonBtn">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
                  <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3">
                    <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#0bb]">
                      @{userData.username}
                    </h1>
                    {userData.isVerified && (
                      <img
                        src={verifiedIcon}
                        alt="Verified"
                        className="w-5 h-5 sm:w-6 sm:h-7"
                        draggable={false}
                      />
                    )}
                  </div>

                  {username !== loggedInUsername && (
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <button
                        onClick={async () => {
                          try {
                            const endpoint = isFollowing
                              ? "unfollow"
                              : "follow";
                            await axios.post(
                              `/user/${endpoint}/${userData._id}`
                            );
                            setIsFollowing(!isFollowing);

                            setUserData((prev) => {
                              if (!prev) return prev;
                              const updatedFollowers = isFollowing
                                ? prev.followers.filter(
                                    (id) => id !== currentUserId
                                  )
                                : [...prev.followers, currentUserId];
                              return { ...prev, followers: updatedFollowers };
                            });
                          } catch (error) {
                            console.error("Follow toggle failed", error);
                          }
                        }}
                        className={`px-4 py-2 font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 text-xs sm:text-base w-full sm:w-auto text-center ${
                          isFollowing
                            ? "bg-gray-700 border border-[#0bb] text-[#0bb] hover:bg-[#14639d] hover:border-[#0bb] hover:text-white"
                            : "bg-gradient-to-r from-[#0bb] to-[#14639d] text-white hover:from-[#099] hover:to-[#0a4d74] hover:shadow-neonBtn"
                        }`}
                      >
                        {isFollowing ? (
                          <UserMinus className="w-4 h-4" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        <span>{isFollowing ? "Unfollow" : "Follow"}</span>
                      </button>

                      <button
                        onClick={() => navigate(`/chat/${userData.username}`)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 hover:from-green-400 hover:to-emerald-500 hover:scale-105 active:scale-95 flex items-center gap-2 text-xs sm:text-base w-full sm:w-auto justify-center"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Message</span>
                      </button>

                      <button
                        onClick={() => setReportModalOpen(true)}
                        className="px-4 py-2 bg-red-600/20 border border-red-600/50 text-red-400 rounded-xl hover:bg-red-600/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 text-xs sm:text-base w-full sm:w-auto justify-center"
                      >
                        <Flag className="w-4 h-4" />
                        <span>Report</span>
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-base sm:text-xl text-[#0bb] mb-3">
                  {userData.name}
                </p>

                {userData.bio && (
                  <p className="text-sm sm:text-base text-[#5599bb] leading-relaxed mb-6 max-w-2xl">
                    {userData.bio}
                  </p>
                )}

                <div className="flex gap-8 justify-center md:justify-start text-xs sm:text-sm">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-[#0bb]">
                      {userPosts.length}
                    </div>
                    <div className="text-[#5599bb]">Posts</div>
                  </div>
                  <a
                    href={`/user/${userData.username}/followers`}
                    className="text-center hover:text-[#099] hover:scale-105 transition-transform duration-300"
                  >
                    <div className="text-xl sm:text-2xl font-bold text-[#0bb]">
                      {userData.followers?.length || 0}
                    </div>
                    <div className="text-[#5599bb]">Followers</div>
                  </a>
                  <a
                    href={`/user/${userData.username}/following`}
                    className="text-center hover:text-[#099] hover:scale-105 transition-transform duration-300"
                  >
                    <div className="text-xl sm:text-2xl font-bold text-[#0bb]">
                      {userData.following?.length || 0}
                    </div>
                    <div className="text-[#5599bb]">Following</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mb-8">
          <div className="bg-[#1a2b46] rounded-3xl p-6 shadow-subtleNeon border border-[#0bb] backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <Grid3X3 className="w-5 h-5 sm:w-6 sm:h-6 text-[#0bb]" />
              <h2 className="text-lg sm:text-xl font-semibold text-[#0bb]">Posts</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#0bb]/50 to-transparent" />
            </div>

            {userPosts.length === 0 ? (
              <div className="text-center py-12 text-[#5599bb]">
                <div className="p-6 bg-[#0bb]/10 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center">
                  <Grid3X3 className="w-8 h-8 sm:w-10 sm:h-10 text-[#0bb]/70" />
                </div>
                <h3 className="text-lg font-bold">No posts yet</h3>
                <p>This user hasn't shared any posts</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userPosts.map((post, index) => (
                  <div
                    key={post._id}
                    className="group bg-[#172133] border border-[#1f2a47] rounded-3xl overflow-hidden shadow-subtleNeon transition-transform duration-300 hover:scale-[1.02] hover:shadow-neonBtn cursor-pointer"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: "fadeInUp 0.5s ease-out forwards",
                    }}
                    onClick={() => {
                      setSelectedPost({ ...post });
                    }}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      {post.media[0]?.type === "image" ? (
                        <>
                          <img
                            src={post.media[0].url}
                            alt="Post"
                            onContextMenu={disableRightClick}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            draggable={false}
                          />
                          <div className="absolute top-3 right-3 p-2 bg-[#172133]/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ImageIcon className="w-4 h-4 text-[#0bb]" />
                          </div>
                        </>
                      ) : (
                        <>
                          <video
                            autoPlay
                            muted
                            draggable={false}
                            src={post.media[0].url}
                            onContextMenu={disableRightClick}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 p-2 bg-[#172133]/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Play className="w-4 h-4 text-[#0bb]" />
                          </div>
                        </>
                      )}
                    </div>

                    {post.caption && (
                      <div className="p-3">
                        <p className="text-xs sm:text-sm text-[#5599bb] line-clamp-2 leading-tight">
                          {post.caption}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Report User Modal */}
        {reportModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#172133] border border-[#0bb] rounded-3xl shadow-neonBtn w-full max-w-md">
              <div className="p-6 border-b border-[#0bb]">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg sm:text-xl font-semibold text-[#0bb]">
                    Report User
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm sm:text-base text-[#5599bb] mb-4">
                  Please describe the reason clearly. Reports without valid
                  reasons will not be reviewed.
                </p>

                <textarea
                  className="w-full px-4 py-3 bg-[#1a2b46] border-2 border-[#0bb] rounded-3xl text-[#0bb] placeholder-[#0bb]/70 focus:outline-none focus:ring-2 focus:ring-[#0bb] transition-all duration-300 resize-none min-h-[120px]"
                  placeholder="Reason for reporting..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setReportModalOpen(false);
                      setReportReason("");
                    }}
                    className="flex-1 px-4 py-3 bg-[#1a2b46] text-[#0bb] rounded-3xl hover:bg-[#0bb]/20 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!reportReason.trim()) {
                        showToast("error", "Please Enter a Reason to Report!");
                        return;
                      }

                      try {
                        setReportLoading(true);
                        await axios.post(`/user/report/${userData._id}`, {
                          message: reportReason.trim(),
                        });
                        showToast("success", "Reported Successfully!");
                        setReportModalOpen(false);
                        setReportReason("");
                      } catch (err) {
                        showToast(
                          "error",
                          err.response?.data?.message || "Failed to report."
                        );
                        console.error("Report failed", err);
                      } finally {
                        setReportLoading(false);
                      }
                    }}
                    disabled={reportLoading}
                    className="flex-1 px-4 py-3 text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-3xl hover:from-red-500 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {reportLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Flag className="w-4 h-4" />
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Post Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#172133] border border-[#0bb] rounded-3xl shadow-neonBtn w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <div className="relative group">
                    <button className="p-2 bg-[#1a2b46]/70 rounded-3xl hover:bg-[#0bb]/40 transition-colors duration-300 peer">
                      <MoreHorizontal className="w-5 h-5 text-[#0bb]" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 bg-[#0bb]/20 border border-[#0bb]/40 rounded-3xl shadow-neonBtn opacity-0 invisible peer-focus:opacity-100 peer-focus:visible hover:opacity-100 hover:visible transition-all duration-300 z-10 min-w-[160px]">
                      <button
                        onClick={() => setReportPostModalOpen(true)}
                        className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-600/30 hover:text-red-300 transition-colors duration-300 rounded-3xl flex items-center gap-2"
                      >
                        <Flag className="w-4 h-4" />
                        Report Post
                      </button>
                    </div>
                  </div>
                </div>

                {selectedPost.media[0]?.type === "image" ? (
                  <img
                    src={selectedPost.media[0].url}
                    alt="Post"
                    className="w-full max-h-[50vh] object-contain bg-black"
                    onContextMenu={disableRightClick}
                    draggable={false}
                  />
                ) : (
                  <video
                    autoPlay
                    draggable={false}
                    src={selectedPost.media[0].url}
                    controls
                    className="w-full max-h-[50vh] object-contain bg-black"
                    onContextMenu={disableRightClick}
                  />
                )}
              </div>

              <div className="flex-1 p-6 overflow-y-auto text-[#0bb]">
                {selectedPost.caption && (
                  <p className="text-lg sm:text-xl leading-relaxed mb-4 break-words">
                    {selectedPost.caption}
                  </p>
                )}

                {selectedPost.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedPost.tags.map((u) => (
                      <a
                        key={u._id}
                        href={`/user/${u.username}`}
                        className="px-3 py-1 bg-[#0bb]/20 border border-[#0bb]/40 rounded-3xl text-[#0bb] text-sm font-medium hover:bg-[#0bb]/30 transition-all duration-300"
                      >
                        @{u.username}
                      </a>
                    ))}
                  </div>
                )}

                {selectedPost.location && (
                  <div className="flex items-center gap-2 text-[#5599bb] mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedPost.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-6 mb-6">
                  <button
                    onClick={() => handleOpenComments(selectedPost)}
                    className="flex items-center gap-2 hover:text-[#14639d] transition-colors duration-300"
                  >
                    <div className="p-2 bg-[#1a2b46] rounded-3xl">
                      <MessageCircle className="w-5 h-5 text-[#0bb]" />
                    </div>
                    <span>{selectedPost.commentCount || 0} comments</span>
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedPost(null);
                      setCommentsModalOpen(false);
                    }}
                    className="px-6 py-3 bg-[#0bb] rounded-3xl hover:bg-[#14639d] transition-colors duration-300 flex items-center gap-2 text-black font-semibold"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Post Modal */}
        {reportPostModalOpen && selectedPost && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#172133] border border-[#0bb] rounded-3xl shadow-neonBtn w-full max-w-md">
              <div className="p-6 border-b border-[#0bb]">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg sm:text-xl font-semibold text-[#0bb]">
                    Report Post
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <textarea
                  className="w-full px-4 py-3 bg-[#1a2b46] border-2 border-[#0bb] rounded-3xl text-[#0bb] placeholder-[#0bb]/70 focus:outline-none focus:ring-2 focus:ring-[#0bb] transition-all duration-300 resize-none min-h-[120px]"
                  placeholder="Write your reason for reporting this post..."
                  value={reportPostReason}
                  onChange={(e) => setReportPostReason(e.target.value)}
                />

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setReportPostModalOpen(false);
                      setReportPostReason("");
                    }}
                    className="flex-1 px-4 py-3 bg-[#1a2b46] text-[#0bb] rounded-3xl hover:bg-[#0bb]/20 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!reportPostReason.trim() || reportPostLoading}
                    onClick={async () => {
                      try {
                        setReportPostLoading(true);
                        await axios.post("/post/report-post", {
                          postId: selectedPost._id,
                          message: reportPostReason.trim(),
                        });

                        showToast("success", "Post reported successfully!");
                        setReportPostModalOpen(false);
                        setReportPostReason("");
                      } catch (err) {
                        showToast(
                          "error",
                          err.response?.data?.message || "Failed to report post."
                        );
                        console.error("Post report error:", err);
                      } finally {
                        setReportPostLoading(false);
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-3xl hover:from-red-500 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {reportPostLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Flag className="w-4 h-4" />
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments Modal */}
        {commentsModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#172133] border border-[#0bb] rounded-3xl shadow-neonBtn w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
              {/* Header */}
              <header className="flex justify-between items-center p-4 border-b border-[#0bb] text-[#0bb] font-semibold text-lg">
                <span>💬 Comments ({comments.length})</span>
                <button
                  aria-label="Close comments"
                  className="hover:text-[#14639d] transition"
                  onClick={() => {
                    setCommentsModalOpen(false);
                    setSelectedPost(null);
                  }}
                >
                  ✕
                </button>
              </header>

              {/* Add Comment Input */}
              <footer className="p-4 border-b border-[#0bb] flex gap-2 bg-[#172133]">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-xl py-2 px-4 bg-[#0bb]/10 border border-[#0bb]/50 text-[#0bb] placeholder-[#0bb]/70 focus:outline-none focus:ring-2 focus:ring-[#0bb] transition"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="rounded-xl bg-[#0bb] hover:bg-[#14639d] px-4 py-2 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </footer>

              {/* Comments List */}
              <main className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#0bb]/50 scrollbar-track-transparent text-[#5599bb]">
                {comments.length === 0 ? (
                  <div className="text-center italic">
                    No comments yet. Be the first!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="flex gap-4 items-start">
                      <img
                        src={comment.user?.profileImageURL || defaultAvatar}
                        alt={comment.user?.username ?? "User"}
                        draggable={false}
                        className="rounded-full w-10 h-10 object-cover border-2 border-[#0bb] flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <a
                            href={`/user/${comment.user?.username}`}
                            className="text-[#0bb] font-semibold hover:text-[#14639d] transition"
                          >
                            @{comment.user?.username}
                          </a>
                          {comment.user?.isVerified && (
                            <img
                              src={verifiedIcon}
                              alt="Verified"
                              className="w-4 h-4"
                              draggable={false}
                            />
                          )}
                        </div>
                        <p className="text-left leading-relaxed whitespace-pre-wrap">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </main>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-3xl shadow-subtleNeon backdrop-blur-md max-w-xs sm:max-w-sm ${
            toast.type === "success"
              ? "bg-green-900/90 border border-green-700 text-green-200"
              : "bg-red-900/90 border border-red-700 text-red-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                toast.type === "success" ? "bg-green-400" : "bg-red-400"
              } animate-pulse`}
            />
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

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
        .shadow-subtleNeon {
          box-shadow: 0 0 3px #0bb6, 0 0 8px #0bb5a;
        }
        .shadow-neonBtn {
          box-shadow: 0 0 4px #0bb8, 0 0 10px #0bb8a;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-[#0bb]::-webkit-scrollbar-thumb {
          background-color: #0bb;
        }
      `}</style>
    </div>
  );
}

export default UserProfile;
