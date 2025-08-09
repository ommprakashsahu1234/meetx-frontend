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
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
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
          video
            .play()
            .catch(() => {
              video.muted = true;
              video.play().catch(() => {});
            });
        } else {
          video.pause();
          video.muted = true;
        }
      });
    }, observerOptions);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
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
      videoRefs.current.forEach((videoElement) => {
        if (observerRef.current) observerRef.current.unobserve(videoElement);
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

        const processPost = (post) => ({
          ...post,
          tags: Array.isArray(post.tags) ? post.tags : [],
          media: Array.isArray(post.media) ? post.media : [],
        });

        setUnviewedPosts((unviewed || []).map(processPost));
        setViewedPosts((viewed || []).map(processPost));
      } catch (error) {
        console.error("Detailed feed error:", error);
        if (error.response) console.error("Server responded with:", error.response.data);
      }
    };

    fetchFeed();
  }, [navigate]);

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
      const updatedCommentCount = await axios.get(`/post/${postId}/comments/count`);

      const updateList = (posts) =>
        posts.map((p) =>
          p._id === postId ? { ...p, commentCount: updatedCommentCount.data.count } : p
        );

      setUnviewedPosts(updateList(unviewedPosts));
      setViewedPosts(updateList(viewedPosts));

      setNewComment("");
      commentInputRef.current?.focus();
    } catch (error) {
      console.error("Failed to add comment:", error);
      if (error.response) console.error("Server responded with:", error.response.data);
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
        { postId: reportPostId, message: reportMessage },
        { headers: { Authorization: `Bearer ${token}` } }
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

  // Very subtle neon effect with very soft shadow
  const neonStyle = { filter: "drop-shadow(0 0 1.5px #099) drop-shadow(0 0 3px #099)" };

  const renderPostCard = (post, index) => (
    <div
      key={post._id}
      className="group bg-[#172133] border border-[#1f2a47] rounded-3xl p-6 shadow-subtleNeonBackdrop backdrop-blur-md hover:shadow-subtleNeonHover transition-transform duration-300 hover:scale-[1.01] hover:border-[#2b3a68] mb-6"
      style={{ animationName: "fadeInUp", animationDuration: "1s", animationTimingFunction: "ease-in-out", animationDelay: "0.5s" }}
    >
      <div className="flex items-center justify-between mb-4">
        <Link to={`/user/${post.authorId?.username}`} className="flex items-center gap-3 group-hover:scale-[1.02] transition-transform duration-300">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1f2a47] group-hover:border-[#0bb] transition-colors duration-300">
            <img src={post.authorId?.profileImageURL || defaultAvatar} alt="Profile" className="w-full h-full object-cover" draggable={false} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#0bb] hover:text-transparent hover:bg-gradient-to-r hover:from-[#0bb] hover:to-[#068] hover:bg-clip-text transition-all duration-300 text-base sm:text-lg">
                @{post.authorId?.username}
              </span>
              {post.authorId?.isVerified && <img src={verifiedIcon} alt="Verified" className="w-5 h-5" draggable={false} />}
            </div>
            <span className="text-xs sm:text-sm text-[#4488bb]">{formatTime(post.createdAt)}</span>
          </div>
        </Link>

        <div className="relative group">
          <button className="p-2 bg-[#1c2b45] rounded-xl hover:bg-[#273b63] transition-colors duration-300 peer">
            <MoreHorizontal className="w-5 h-5 text-[#4488bb]" style={neonStyle} />
          </button>
          <div className="absolute right-0 top-full mt-2 bg-[#1c2b45] border border-[#1f2a47] rounded-2xl shadow-subtleNeonDropdown opacity-0 invisible peer-focus:opacity-100 peer-focus:visible hover:opacity-100 hover:visible transition-all duration-300 z-10 min-w-[160px]">
            <button
              onClick={() => openReportModal(post)}
              className="w-full px-4 py-3 text-left text-[#aaccee] hover:bg-[#273b63] hover:text-[#e44e52] transition-colors duration-300 rounded-2xl flex items-center gap-2"
            >
              <Flag className="w-4 h-4" style={neonStyle} />
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
              className="rounded-2xl w-full object-cover aspect-[4/3] border border-[#1f2a47]"
              alt="Post"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
            <div className="absolute top-4 left-4 px-3 py-1 bg-[#11202a]/80 backdrop-blur-md rounded-full border border-[#1f2a47] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0bb]" style={neonStyle} />
                <span className="text-[#ddefee] text-sm font-medium">Image</span>
              </div>
            </div>
          </div>
        ) : Array.isArray(post.media) && post.media[0]?.type === "video" ? (
          <div className="relative">
            <video
              ref={(el) => {
                if (el) registerVideo(el, post._id);
                else unregisterVideo(post._id);
              }}
              src={post.media[0].url}
              className="rounded-2xl w-full object-cover aspect-[16/9] border border-[#1f2a47]"
              loop
              muted={true}
              playsInline
              controlsList="nodownload"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              controls
            />
            <div className="absolute top-4 left-4 px-3 py-1 bg-[#11202a]/80 backdrop-blur-md rounded-full border border-[#1f2a47]">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#0bb]" style={neonStyle} />
                <span className="text-[#ddefee] text-sm font-medium">Video</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {post.caption && (
        <div className="mb-4">
          <p className="text-base sm:text-lg text-[#88bbdd] leading-relaxed break-words">{post.caption}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag._id}
                to={`/user/${tag.username}`}
                className="px-3 py-1 bg-gradient-to-r from-[#0b4253]/40 to-[#143963]/40 border border-[#0a4d74]/60 rounded-xl text-[#0bb] text-xs sm:text-sm font-medium hover:from-[#0a526b]/60 hover:to-[#145279]/60 transition-all duration-300"
              >
                @{tag.username}
              </Link>
            ))}
          </div>
        )}
        {post.location && (
          <div className="flex items-center gap-2 text-[#5588aa] text-xs sm:text-sm">
            <MapPin className="w-4 h-4" style={neonStyle} />
            <span>{post.location}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6">
          <button onClick={() => handleOpenComments(post)} className="flex items-center gap-2 group">
            <div className="p-2 bg-[#1c2b3f] rounded-xl group-hover:bg-[#27385e] transition-colors duration-300">
              <MessageCircle className="w-5 h-5 text-[#4488bb] group-hover:text-[#0bb] transition-colors duration-300" style={neonStyle} />
            </div>
            <span className="text-[#4488bb] hover:text-[#0bb] transition-colors duration-300 text-sm sm:text-base">
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
            className="w-full px-4 py-3 bg-[#172133] border-2 border-[#1f2a47] rounded-2xl text-[#0bb] placeholder-[#0a4d74] focus:outline-none focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/40 transition-all duration-300 hover:border-[#145279] text-sm sm:text-base"
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
          className="px-6 py-3 bg-gradient-to-r from-[#0bb] to-[#145279] text-white font-semibold rounded-2xl shadow-subtleNeonBtn transition-all duration-300 hover:from-[#099] hover:to-[#0a4d74] hover:shadow-subtleNeonBtnHover hover:scale-105 active:scale-95 flex items-center gap-2 text-sm sm:text-base"
        >
          <Send className="w-4 h-4" style={neonStyle} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#172133] text-[#0bb]">
      <div className="sticky top-0 z-40 bg-[#172133]/95 backdrop-blur-md border-b border-[#1f2a47]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-[#0bb] to-[#145279] rounded-2xl shadow-subtleNeonBtn">
              <HomeIcon className="w-6 h-6 text-white" style={neonStyle} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#0bb] to-[#145279] bg-clip-text text-transparent">
                Home
              </h1>
              <p className="text-[#4488bb] text-sm sm:text-base">Discover amazing content</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {suggestedUsers.length > 0 && (
          <div className="mb-8">
            <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-6 shadow-subtleNeon backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-[#0bb]" style={neonStyle} />
                <h2 className="text-xl font-semibold text-[#0bb]">Suggested for You</h2>
              </div>
              <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
                {suggestedUsers.map((sugg) => (
                  <Link
                    key={sugg._id}
                    to={`/user/${sugg.username}`}
                    className="flex-shrink-0 bg-[#1a2b47] border border-[#1f2a47] rounded-2xl p-4 hover:bg-[#273b62] hover:border-[#0bb] transition-all duration-300 hover:scale-105 min-w-[140px] group"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#1f2a47] group-hover:border-[#0bb] transition-colors duration-300 mx-auto mb-3">
                        <img
                          src={sugg.profileImageURL || defaultAvatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="font-semibold text-[#0bb] text-sm group-hover:text-[#0dd] transition-colors duration-300">
                          @{sugg.username}
                        </span>
                        {sugg.isVerified && (
                          <img src={verifiedIcon} alt="Verified" className="w-4 h-4" draggable={false} />
                        )}
                      </div>
                      <p className="text-xs text-[#5588aa] truncate">{sugg.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {unviewedPosts.length === 0 && viewedPosts.length === 0 ? (
          <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-12 shadow-subtleNeon backdrop-blur-md text-center">
            <div className="p-6 bg-[#1b2b47]/70 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <HomeIcon className="w-12 h-12 text-[#4488bb]" style={neonStyle} />
            </div>
            <h3 className="text-2xl font-bold text-[#4488bb] mb-2">No posts yet</h3>
            <p className="text-[#4488bb] text-lg">Follow some users to see their posts in your feed</p>
          </div>
        ) : (
          <>
            {unviewedPosts.map((post, index) => renderPostCard(post, index))}
            {viewedPosts.map((post, index) => renderPostCard(post, index + unviewedPosts.length))}
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#172133] border border-[#1f2a47] rounded-full text-[#4488bb]">
                <Sparkles className="w-4 h-4" style={neonStyle} />
                <span>You're all caught up!</span>
              </div>
            </div>
          </>
        )}

        {/* COMMENTS MODAL */}
        {commentsModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl shadow-subtleNeon w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-[#1f2a47]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-[#0bb] flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#0cc]" style={neonStyle} />
                    Comments
                  </h3>
                  <button
                    onClick={() => {
                      setCommentsModalOpen(false);
                      setSelectedPost(null);
                    }}
                    className="p-2 bg-[#1c2b45] rounded-xl hover:bg-[#273b62] transition-colors duration-300"
                  >
                    <X className="w-5 h-5 text-[#4488bb]" style={neonStyle} />
                  </button>
                </div>
              </div>
              <div className="p-4 border-b border-[#1f2a47]">
                <div className="flex gap-3">
                  <input
                    ref={commentInputRef}
                    type="text"
                    className="flex-1 px-4 py-3 bg-[#172133] border-2 border-[#1f2a47] rounded-2xl text-[#0bb] placeholder-[#0a4d74] focus:outline-none focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/40 transition-all duration-300"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    onClick={() => handleAddComment(selectedPost._id)}
                    className="px-6 py-3 bg-gradient-to-r from-[#0bb] to-[#145279] text-white font-semibold rounded-2xl shadow-subtleNeonBtn transition-all duration-300 hover:from-[#099] hover:to-[#0a4d74] hover:shadow-subtleNeonBtnHover hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" style={neonStyle} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-[#145279] mx-auto mb-3" style={neonStyle} />
                    <p className="text-[#4488bb]">No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment._id} className="flex items-start gap-3 group">
                        <Link
                          to={`/user/${comment.user?.username}`}
                          onClick={() => setCommentsModalOpen(false)}
                          className="flex-shrink-0"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1f2a47] group-hover:border-[#0bb] transition-colors duration-300">
                            <img
                              src={comment.user?.profileImageURL || defaultAvatar}
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
                              className="font-semibold text-[#0bb] hover:text-[#0dd] transition-colors duration-300"
                              onClick={() => setCommentsModalOpen(false)}
                            >
                              @{comment.user?.username}
                            </Link>
                            {comment.user?.isVerified && (
                              <img src={verifiedIcon} alt="Verified" className="w-4 h-4" draggable={false} />
                            )}
                          </div>
                          <p className="text-[#4488bb] leading-relaxed break-words text-left text-sm">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {reportModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl shadow-subtleNeon w-full max-w-md">
              <div className="p-6 border-b border-[#1f2a47]">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-[#d94e53]" style={neonStyle} />
                  <h3 className="text-xl font-semibold text-[#0bb]">Report Post</h3>
                </div>
              </div>
              <div className="p-6">
                <textarea
                  className="w-full px-4 py-3 bg-[#172133] border-2 border-[#1f2a47] rounded-2xl text-[#0bb] placeholder-[#0a4d74] focus:outline-none focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/40 transition-all duration-300 resize-none min-h-[120px]"
                  placeholder="Please describe why you're reporting this post..."
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                />
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-[#1c2a41] text-[#0bb] rounded-2xl hover:bg-[#273b62] transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportSubmit}
                    disabled={!reportMessage.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#d94e53] to-[#b63a3f] text-white rounded-2xl hover:from-[#cc4549] hover:to-[#a22f32] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Flag className="w-4 h-4" style={neonStyle} />
                    Submit Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 duration-300">
          <div
            className={`px-6 py-4 rounded-2xl shadow-subtleNeon border backdrop-blur-md ${
              toast.type === "success"
                ? "bg-green-900/90 border-green-700 text-green-200"
                : "bg-red-900/90 border-red-700 text-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  toast.type === "success" ? "bg-green-500" : "bg-red-500"
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

        /* Very Subtle Neon Shadows */
        .shadow-subtleNeon {
          box-shadow: 0 0 2px #099, 0 0 6px #09930a1a;
        }
        .shadow-subtleNeonHover:hover {
          box-shadow: 0 0 3px #099, 0 0 9px #09930a1a;
        }
        .shadow-subtleNeonBtn {
          box-shadow: 0 0 2px #09960a1a;
        }
        .shadow-subtleNeonBtnHover:hover {
          box-shadow: 0 0 4px #099, 0 0 8px #09930a1a;
        }
        .shadow-subtleNeonDropdown {
          box-shadow: 0 0 6px #09930a1a, 0 0 12px #09920a1a;
        }
      `}</style>
    </div>
  );
}

export default Home;
