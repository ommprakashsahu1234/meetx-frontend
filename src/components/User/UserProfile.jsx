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
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likesList, setLikesList] = useState([]);
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

  const handleOpenLikes = async (post) => {
    try {
      const res = await axios.get(`/post/${post._id}/likes`);
      setSelectedPost(post);
      setLikesList(res.data.likes || []);
      setLikesModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch likes:", error);
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

  const handleLikeToggle = async (postId, isCurrentlyLiked) => {
    try {
      const updatedPosts = userPosts.map((p) => {
        if (p._id === postId) {
          const newLikes = isCurrentlyLiked
            ? p.likes.filter((id) => id !== currentUserId)
            : [...p.likes, currentUserId];

          return {
            ...p,
            likedByUser: !isCurrentlyLiked,
            likes: newLikes,
          };
        }
        return p;
      });
      setUserPosts(updatedPosts);
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost((prev) => ({
          ...prev,
          likedByUser: !isCurrentlyLiked,
          likes: isCurrentlyLiked
            ? prev.likes.filter((id) => id !== currentUserId)
            : [...prev.likes, currentUserId],
        }));
      }

      await axios.post(
        `/post/${postId}/${isCurrentlyLiked ? "unlike" : "like"}`
      );
    } catch (e) {
      console.error("Like toggle failed:", e);

      const revertedPosts = userPosts.map((p) => {
        if (p._id === postId) {
          return {
            ...p,
            likedByUser: isCurrentlyLiked,
            likes: isCurrentlyLiked
              ? [...p.likes, currentUserId]
              : p.likes.filter((id) => id !== currentUserId),
          };
        }
        return p;
      });
      setUserPosts(revertedPosts);

      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost((prev) => ({
          ...prev,
          likedByUser: isCurrentlyLiked,
          likes: isCurrentlyLiked
            ? [...prev.likes, currentUserId]
            : prev.likes.filter((id) => id !== currentUserId),
        }));
      }
    }
  };

  const disableRightClick = (e) => e.preventDefault();

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-12 shadow-2xl backdrop-blur-md text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back</span>
          </button>
        </div>

        <div className="mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-gray-600 shadow-2xl">
                  <img
                    src={userData.profileImageURL || defaultAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                      @{userData.username}
                    </h1>
                    {userData.isVerified && (
                      <img
                        src={verifiedIcon}
                        alt="Verified"
                        className="w-7 h-7"
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
                        className={`px-4 py-2 font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 ${
                          isFollowing
                            ? "bg-gray-700 border border-gray-600 text-gray-100 hover:bg-gray-600 hover:border-red-500 hover:text-red-400"
                            : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl hover:shadow-cyan-500/25"
                        } text-sm sm:text-base w-full sm:w-auto text-center`}
                      >
                        {isFollowing ? (
                          <UserMinus className="w-4 h-4" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        {isFollowing ? "Unfollow" : "Follow"}
                      </button>

                      <button
                        onClick={() => navigate(`/chat/${userData.username}`)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 hover:from-green-400 hover:to-emerald-500 hover:scale-105 active:scale-95 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>

                      <button
                        onClick={() => setReportModalOpen(true)}
                        className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                      >
                        <Flag className="w-4 h-4" />
                        Report
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xl text-gray-300 mb-3">{userData.name}</p>

                {userData.bio && (
                  <p className="text-gray-400 leading-relaxed mb-6 max-w-2xl">
                    {userData.bio}
                  </p>
                )}

                <div className="flex gap-8 justify-center md:justify-start">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-100">
                      {userPosts.length}
                    </div>
                    <div className="text-gray-400 text-sm">Posts</div>
                  </div>
                  <a
                    href={`/user/${userData.username}/followers`}
                    className="text-center hover:scale-105 transition-transform duration-300"
                  >
                    <div className="text-2xl font-bold text-gray-100">
                      {userData.followers?.length || 0}
                    </div>
                    <div className="text-gray-400 text-sm">Followers</div>
                  </a>
                  <a
                    href={`/user/${userData.username}/following`}
                    className="text-center hover:scale-105 transition-transform duration-300"
                  >
                    <div className="text-2xl font-bold text-gray-100">
                      {userData.following?.length || 0}
                    </div>
                    <div className="text-gray-400 text-sm">Following</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <Grid3X3 className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold text-gray-100">Posts</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-600/50 to-transparent"></div>
            </div>

            {userPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-6 bg-gray-700/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Grid3X3 className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-400">
                  This user hasn't shared any posts
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userPosts.map((post, index) => (
                  <div
                    key={post._id}
                    className="group bg-gray-700 border border-gray-600 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 hover:scale-[1.02] hover:border-gray-500 cursor-pointer"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: "fadeInUp 0.5s ease-out forwards",
                    }}
                    onClick={() => {
                      const likedByUser = post.likes?.includes(currentUserId);
                      setSelectedPost({ ...post, likedByUser });
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
                          <div className="absolute top-3 right-3 p-2 bg-gray-900/70 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ImageIcon className="w-4 h-4 text-white" />
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
                          <div className="absolute top-3 right-3 p-2 bg-gray-900/70 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </>
                      )}

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex items-center gap-4 text-white">
                          <div className="flex items-center gap-1">
                            <Heart className="w-5 h-5" />
                            <span className="font-medium">
                              {post.likes?.length || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-5 h-5" />
                            <span className="font-medium">
                              {post.commentCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {post.caption && (
                      <div className="p-3">
                        <p className="text-sm text-gray-300 line-clamp-2 leading-tight">
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

        {reportModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-500" />
                  <h3 className="text-xl font-semibold text-gray-100">
                    Report User
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-400 text-sm mb-4">
                  Please describe the reason clearly. Reports without valid
                  reasons will not be reviewed.
                </p>

                <textarea
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 resize-none min-h-[120px]"
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
                    className="flex-1 px-4 py-3 bg-gray-700 text-gray-100 rounded-2xl hover:bg-gray-600 transition-colors duration-300"
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
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-400 hover:to-red-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        {selectedPost && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <div className="relative group">
                    <button className="p-2 bg-gray-900/70 backdrop-blur-sm rounded-xl hover:bg-gray-800 transition-colors duration-300 peer">
                      <MoreHorizontal className="w-5 h-5 text-white" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 bg-gray-700 border border-gray-600 rounded-2xl shadow-2xl opacity-0 invisible peer-focus:opacity-100 peer-focus:visible hover:opacity-100 hover:visible transition-all duration-300 z-10 min-w-[160px]">
                      <button
                        onClick={() => setReportPostModalOpen(true)}
                        className="w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-600 hover:text-red-400 transition-colors duration-300 rounded-2xl flex items-center gap-2"
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

              <div className="flex-1 p-6 overflow-y-auto">
                {selectedPost.caption && (
                  <p className="text-xl text-gray-100 leading-relaxed mb-4 break-words">
                    {selectedPost.caption}
                  </p>
                )}

                {selectedPost.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedPost.tags.map((u) => (
                      <a
                        key={u._id}
                        href={`/user/${u.username}`}
                        className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 text-sm font-medium hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
                      >
                        @{u.username}
                      </a>
                    ))}
                  </div>
                )}

                {selectedPost.location && (
                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedPost.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-6 mb-6">
                  <button
                    onClick={() =>
                      handleLikeToggle(
                        selectedPost._id,
                        selectedPost.likedByUser
                      )
                    }
                    className="flex items-center gap-2 group"
                  >
                    <div
                      className={`p-2 rounded-xl transition-all duration-300 ${
                        selectedPost.likedByUser
                          ? "bg-red-500/20 group-hover:bg-red-500/30"
                          : "bg-gray-700 group-hover:bg-gray-600"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 transition-all duration-300 ${
                          selectedPost.likedByUser
                            ? "text-red-500 fill-red-500"
                            : "text-gray-400 group-hover:text-red-400"
                        }`}
                      />
                    </div>
                    <span
                      className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenLikes(selectedPost);
                      }}
                    >
                      {selectedPost.likes?.length || 0} likes
                    </span>
                  </button>

                  <button
                    onClick={() => handleOpenComments(selectedPost)}
                    className="flex items-center gap-2 group"
                  >
                    <div className="p-2 bg-gray-700 rounded-xl group-hover:bg-gray-600 transition-colors duration-300">
                      <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                    </div>
                    <span className="text-gray-300 hover:text-cyan-400 transition-colors duration-300">
                      {selectedPost.commentCount || 0} comments
                    </span>
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedPost(null);
                      setLikesModalOpen(false);
                      setCommentsModalOpen(false);
                    }}
                    className="px-6 py-3 bg-gray-700 text-gray-100 rounded-2xl hover:bg-gray-600 transition-colors duration-300 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {reportPostModalOpen && selectedPost && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-500" />
                  <h3 className="text-xl font-semibold text-gray-100">
                    Report Post
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <textarea
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 resize-none min-h-[120px]"
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
                    className="flex-1 px-4 py-3 bg-gray-700 text-gray-100 rounded-2xl hover:bg-gray-600 transition-colors duration-300"
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
                          err.response?.data?.message ||
                            "Failed to report post."
                        );
                        console.error("Post report error:", err);
                      } finally {
                        setReportPostLoading(false);
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-400 hover:to-red-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        {likesModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Liked by
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedPost(null);
                      setLikesModalOpen(false);
                    }}
                    className="p-2 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors duration-300"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[60vh] p-4">
                {likesList.map((like) => (
                  <div
                    key={like._id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-2xl transition-colors duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-cyan-400 transition-colors duration-300">
                      <img
                        src={like.user?.profileImageURL || defaultAvatar}
                        className="w-full h-full object-cover"
                        alt={like.user?.username}
                        draggable={false}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-100 group-hover:text-cyan-400 transition-colors duration-300 truncate">
                          @{like.user?.username}
                        </span>
                        {like.user?.isVerified && (
                          <img
                            src={verifiedIcon}
                            alt="Verified"
                            className="w-4 h-4"
                            draggable={false}
                          />
                        )}
                      </div>
                      {like.user?.name && (
                        <p className="text-gray-400 text-sm truncate">
                          {like.user.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {commentsModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                    Comments
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedPost(null);
                      setCommentsModalOpen(false);
                    }}
                    className="p-2 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors duration-300"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-4 border-b border-gray-700">
                <div className="flex gap-3">
                  <input
                    ref={commentInputRef}
                    type="text"
                    className="flex-1 px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="flex items-start gap-3 group"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-cyan-400 transition-colors duration-300">
                          <img
                            src={comment.user?.profileImageURL || defaultAvatar}
                            className="w-full h-full object-cover"
                            alt="Profile"
                            draggable={false}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-100 group-hover:text-cyan-400 transition-colors duration-300">
                              @{comment.user?.username}
                            </span>
                            {comment.user?.isVerified && (
                              <img
                                src={verifiedIcon}
                                alt="Verified"
                                className="w-4 h-4"
                                draggable={false}
                              />
                            )}
                          </div>
                          <p className="text-gray-300 leading-relaxed break-words">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
}

export default UserProfile;
