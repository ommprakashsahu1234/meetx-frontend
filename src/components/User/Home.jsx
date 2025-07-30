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
  Heart,
  MessageCircle,
  Send,
  MapPin,
  MoreHorizontal,
  Flag,
  X,
  Users,
  Home as HomeIcon,
  Sparkles,
  Image as ImageIcon,
  Play,
} from "lucide-react";

function Home() {
  const { isLoggedIn } = useContext(AuthContext);
  
  const [unviewedPosts, setUnviewedPosts] = useState([]);
  const [viewedPosts, setViewedPosts] = useState([]);
  const [toast, setToast] = useState(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);

  const [newComment, setNewComment] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [likesList, setLikesList] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportPostId, setReportPostId] = useState(null);

  const commentInputRef = useRef();
  const navigate = useNavigate();
  const videoRefs = useRef(new Map());
  const observerRef = useRef(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Intersection Observer for video autoplay
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.6,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
          video.muted = false;
          video.play().catch((error) => {
            console.log("Video autoplay failed:", error);
            video.muted = true;
            video
              .play()
              .catch((e) => console.log("Muted autoplay also failed:", e));
          });
        } else {
          video.pause();
          video.muted = true;
        }
      });
    }, observerOptions);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const registerVideo = useCallback((videoElement, postId) => {
    if (videoElement && observerRef.current) {
      videoRefs.current.set(postId, videoElement);
      observerRef.current.observe(videoElement);
    }
  }, []);

  const unregisterVideo = useCallback((postId) => {
    const videoElement = videoRefs.current.get(postId);
    if (videoElement && observerRef.current) {
      observerRef.current.unobserve(videoElement);
      videoRefs.current.delete(postId);
    }
  }, []);

  useEffect(() => {
    return () => {
      videoRefs.current.forEach((videoElement, postId) => {
        if (observerRef.current) {
          observerRef.current.unobserve(videoElement);
        }
      });
      videoRefs.current.clear();
    };
  }, [unviewedPosts, viewedPosts]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        if (!currentUserId) return;
        const res = await axios.get(`/user/suggestions/${currentUserId}`);
        setSuggestedUsers(res.data || []);
      } catch (err) {
        console.error("Suggestions fetch failed", err);
      }
    };

    fetchSuggestions();
  }, [currentUserId]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const fetchFeed = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const profileRes = await axios.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userId = profileRes.data.user._id;
        setCurrentUserId(userId);

        const res = await axios.get("/post/feed", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { unviewed, viewed } = res.data;

        const processPost = (post) => {
          const likes = Array.isArray(post.likes) ? post.likes : [];
          
          return {
            ...post,
            likes: likes,
            tags: Array.isArray(post.tags) ? post.tags : [],
            media: Array.isArray(post.media) ? post.media : [],
            likedByUser: likes.length > 0 && userId && likes
              .map((like) => {
                if (typeof like === 'object' && like._id) {
                  return like._id.toString();
                } else if (typeof like === 'string') {
                  return like.toString();
                } else {
                  return like?.toString();
                }
              })
              .includes(userId.toString())
          };
        };

        const processedUnviewed = (unviewed || []).map(processPost);
        const processedViewed = (viewed || []).map(processPost);

        setUnviewedPosts(processedUnviewed);
        setViewedPosts(processedViewed);
        
      } catch (error) {
        console.error("Detailed feed error:", error);
        if (error.response) {
          console.error("Server responded with:", error.response.data);
        }
      }
    };

    fetchFeed();
  }, [navigate]);

  const handleLikeToggle = async (postId, isLiked) => {
    try {
      const updateList = (posts) =>
        posts.map((p) =>
          p._id === postId
            ? {
                ...p,
                likedByUser: !isLiked,
                likes: isLiked
                  ? Array.isArray(p.likes)
                    ? p.likes.filter((like) => {
                        const likeId = typeof like === 'object' ? like._id : like;
                        return likeId !== currentUserId;
                      })
                    : []
                  : [...(Array.isArray(p.likes) ? p.likes : []), currentUserId],
              }
            : p
        );

      // Update UI optimistically
      setUnviewedPosts(updateList(unviewedPosts));
      setViewedPosts(updateList(viewedPosts));

      // Update selected post if it's open
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(prev => ({
          ...prev,
          likedByUser: !isLiked,
          likes: isLiked
            ? Array.isArray(prev.likes)
              ? prev.likes.filter((like) => {
                  const likeId = typeof like === 'object' ? like._id : like;
                  return likeId !== currentUserId;
                })
              : []
            : [...(Array.isArray(prev.likes) ? prev.likes : []), currentUserId],
        }));
      }

      // Make API call
      await axios.post(`/post/${postId}/${isLiked ? "unlike" : "like"}`);
    } catch (error) {
      console.error("Error toggling like:", error);
      
      // Revert optimistic update on error
      const revertList = (posts) =>
        posts.map((p) =>
          p._id === postId
            ? {
                ...p,
                likedByUser: isLiked, // Revert to original state
                likes: isLiked
                  ? [...(Array.isArray(p.likes) ? p.likes : []), currentUserId]
                  : Array.isArray(p.likes)
                    ? p.likes.filter((like) => {
                        const likeId = typeof like === 'object' ? like._id : like;
                        return likeId !== currentUserId;
                      })
                    : [],
              }
            : p
        );
      
      setUnviewedPosts(revertList(unviewedPosts));
      setViewedPosts(revertList(viewedPosts));
      
      showToast("error", "Failed to update like status");
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/post/${postId}/comment`,
        { text: newComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (commentsModalOpen && selectedPost && selectedPost._id === postId) {
        const updated = await axios.get(`/post/${postId}/comments`);
        setComments(updated.data.comments || []);
      }
      const updatedCommentCount = await axios.get(
        `/post/${postId}/comments/count`
      );

      const updateList = (posts) =>
        posts.map((p) =>
          p._id === postId
            ? {
                ...p,
                commentCount: updatedCommentCount.data.count,
              }
            : p
        );

      setUnviewedPosts(updateList(unviewedPosts));
      setViewedPosts(updateList(viewedPosts));

      setNewComment("");
      commentInputRef.current?.focus();
    } catch (error) {
      console.error("Failed to add comment:", error);
      if (error.response) {
        console.error("Server responded with:", error.response.data);
      }
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
      const res = await axios.get(`/post/${post._id}/comments`);
      setSelectedPost(post);
      setComments(res.data.comments || []);
      setCommentsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const openReportModal = (post) => {
    setReportPostId(post._id);
    setReportMessage("");
    setReportModalOpen(true);
  };

  const handleReportSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/post/report-post",
        {
          postId: reportPostId,
          message: reportMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showToast("success", "Post Reported Successfully!");
      setReportModalOpen(false);
      setReportPostId(null);
      setReportMessage("");
    } catch (error) {
      console.error("Failed to report post:", error);
      const errMsg = error.response?.data?.message || "Failed to report Post!";
      showToast("error", errMsg);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const renderPostCard = (post, index) => {
    // Use the pre-calculated likedByUser from processed data
    const likedByUser = post.likedByUser || false;

    return (
      <div
        key={post._id}
        className="group bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 hover:scale-[1.01] hover:border-gray-600 mb-6"
        style={{
          animationName: "fadeIn",
          animationDuration: "1s",
          animationTimingFunction: "ease-in-out",
          animationDelay: "0.5s",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <Link
            to={`/user/${post.authorId?.username}`}
            className="flex items-center gap-3 group-hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-cyan-400 transition-colors duration-300">
              <img
                src={post.authorId?.profileImageURL || defaultAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-100 hover:text-transparent hover:bg-gradient-to-r hover:from-cyan-400 hover:to-blue-400 hover:bg-clip-text transition-all duration-300">
                  @{post.authorId?.username}
                </span>
                {post.authorId?.isVerified && (
                  <img
                    src={verifiedIcon}
                    alt="Verified"
                    className="w-5 h-5"
                    draggable={false}
                  />
                )}
              </div>
              <span className="text-sm text-gray-400">
                {formatTime(post.createdAt)}
              </span>
            </div>
          </Link>

          <div className="relative group">
            <button className="p-2 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors duration-300 peer">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
            <div className="absolute right-0 top-full mt-2 bg-gray-700 border border-gray-600 rounded-2xl shadow-2xl opacity-0 invisible peer-focus:opacity-100 peer-focus:visible hover:opacity-100 hover:visible transition-all duration-300 z-10 min-w-[160px]">
              <button
                onClick={() => openReportModal(post)}
                className="w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-600 hover:text-red-400 transition-colors duration-300 rounded-2xl flex items-center gap-2"
              >
                <Flag className="w-4 h-4" />
                Report Post
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4 relative group">
          {Array.isArray(post.media) && post.media[0]?.type === "image" ? (
            <div className="relative">
              <img
                src={post.media[0].url}
                className="rounded-2xl w-full object-cover aspect-[4/3] border border-gray-600"
                alt="Post"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-gray-900/80 backdrop-blur-md rounded-full border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span className="text-white text-sm font-medium">Image</span>
                </div>
              </div>
            </div>
          ) : Array.isArray(post.media) && post.media[0]?.type === "video" ? (
            <div className="relative">
              <video
                ref={(el) => {
                  if (el) {
                    registerVideo(el, post._id);
                  } else {
                    unregisterVideo(post._id);
                  }
                }}
                src={post.media[0].url}
                className="rounded-2xl w-full object-cover aspect-[16/9] border border-gray-600"
                loop
                muted={true}
                playsInline
                controlsList="nodownload"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                controls
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-gray-900/80 backdrop-blur-md rounded-full border border-gray-600">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-cyan-400" />
                  <span className="text-white text-sm font-medium">Video</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {post.caption && (
          <div className="mb-4">
            <p className="text-lg text-gray-100 leading-relaxed break-words">
              {post.caption}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag._id}
                  to={`/user/${tag.username}`}
                  className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 text-sm font-medium hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
                >
                  @{tag.username}
                </Link>
              ))}
            </div>
          )}
          {post.location && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{post.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleLikeToggle(post._id, likedByUser)}
              className="flex items-center gap-2 group"
            >
              <div
                className={`p-2 rounded-xl transition-all duration-300 ${
                  likedByUser
                    ? "bg-red-500/20 group-hover:bg-red-500/30"
                    : "bg-gray-700 group-hover:bg-gray-600"
                }`}
              >
                <Heart
                  className={`w-5 h-5 transition-all duration-300 ${
                    likedByUser
                      ? "text-red-500 fill-red-500"
                      : "text-gray-400 group-hover:text-red-400"
                  }`}
                />
              </div>
              <span
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenLikes(post);
                }}
              >
                {Array.isArray(post.likes) ? post.likes.length : 0} likes
              </span>
            </button>

            <button
              onClick={() => handleOpenComments(post)}
              className="flex items-center gap-2 group"
            >
              <div className="p-2 bg-gray-700 rounded-xl group-hover:bg-gray-600 transition-colors duration-300">
                <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
              </div>
              <span className="text-gray-300 hover:text-cyan-400 transition-colors duration-300">
                {post.commentCount || 0} comments
              </span>
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative group">
            <input
              ref={commentInputRef}
              type="text"
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
              placeholder="Add a comment..."
              value={selectedPostId === post._id ? newComment : ""}
              onChange={(e) => {
                setSelectedPostId(post._id);
                setNewComment(e.target.value);
              }}
            />
          </div>
          <button
            onClick={() => handleAddComment(post._id)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="sticky top-0 z-40 bg-gray-800/80 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
              <HomeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Home
              </h1>
              <p className="text-gray-400">Discover amazing content</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {suggestedUsers.length > 0 && (
          <div className="mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-semibold text-gray-100">
                  Suggested for You
                </h2>
              </div>

              <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
                {suggestedUsers.map((sugg) => (
                  <Link
                    key={sugg._id}
                    to={`/user/${sugg.username}`}
                    className="flex-shrink-0 bg-gray-700 border border-gray-600 rounded-2xl p-4 hover:bg-gray-600 hover:border-cyan-500 transition-all duration-300 hover:scale-105 min-w-[140px] group"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-cyan-400 transition-colors duration-300 mx-auto mb-3">
                        <img
                          src={sugg.profileImageURL || defaultAvatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="font-semibold text-gray-100 text-sm group-hover:text-cyan-400 transition-colors duration-300">
                          @{sugg.username}
                        </span>
                        {sugg.isVerified && (
                          <img
                            src={verifiedIcon}
                            alt="Verified"
                            className="w-4 h-4"
                            draggable={false}
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {sugg.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {unviewedPosts.length === 0 && viewedPosts.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-12 shadow-2xl backdrop-blur-md text-center">
            <div className="p-6 bg-gray-700/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <HomeIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-400 text-lg">
              Follow some users to see their posts in your feed
            </p>
          </div>
        ) : (
          <>
            {unviewedPosts.map((post, index) => renderPostCard(post, index))}
            {viewedPosts.map((post, index) =>
              renderPostCard(post, index + unviewedPosts.length)
            )}

            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span>You're all caught up!</span>
              </div>
            </div>
          </>
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
                      setLikesModalOpen(false);
                      setSelectedPost(null);
                    }}
                    className="p-2 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors duration-300"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[60vh] p-4">
                {likesList.length === 0 ? (
                  <p className="text-gray-400 text-center">No likes yet.</p>
                ) : (
                  likesList.map((like) => (
                    <Link
                      to={`/user/${like.user?.username}`}
                      key={like._id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-2xl transition-colors duration-300 group"
                      onClick={() => setLikesModalOpen(false)}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-cyan-400 transition-colors duration-300">
                        <img
                          src={like.user?.profileImageURL || defaultAvatar}
                          alt={like.user?.username}
                          className="w-full h-full object-cover"
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
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* COMMENTS MODAL */}
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
                      setCommentsModalOpen(false);
                      setSelectedPost(null);
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
                    onClick={() => handleAddComment(selectedPost._id)}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:scale-105 active:scale-95 flex items-center gap-2"
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
                        <Link
                          to={`/user/${comment.user?.username}`}
                          onClick={() => setCommentsModalOpen(false)}
                          className="flex-shrink-0"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-cyan-400 transition-colors duration-300">
                            <img
                              src={
                                comment.user?.profileImageURL || defaultAvatar
                              }
                              className="w-full h-full object-cover"
                              alt="Profile"
                              draggable={false}
                            />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              to={`/user/${comment.user?.username}`}
                              className="font-semibold text-gray-100 hover:text-cyan-400 transition-colors duration-300"
                              onClick={() => setCommentsModalOpen(false)}
                            >
                              @{comment.user?.username}
                            </Link>
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

        {/* REPORT MODAL */}
        {reportModalOpen && (
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
                  placeholder="Please describe why you're reporting this post..."
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                />

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 text-gray-100 rounded-2xl hover:bg-gray-600 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportSubmit}
                    disabled={!reportMessage.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-400 hover:to-red-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Flag className="w-4 h-4" />
                    Submit Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TOAST */}
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

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default Home;
