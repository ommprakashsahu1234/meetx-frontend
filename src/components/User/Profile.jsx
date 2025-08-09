import React, { useEffect, useState, useRef } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/images/user.png";
import verifiedIcon from "../../assets/images/verified.svg";
import heartFilled from "../../assets/images/heart-filled.png";
import heartOutline from "../../assets/images/heart-outline.png";
import commentIcon from "../../assets/images/comment-icon.png";
import viewsIcon from "../../assets/images/view-icon.png";

function Profile() {
  const [userData, setUserData] = useState(null);
  const [toast, setToast] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCaption, setEditCaption] = useState("");
  const [editVisibility, setEditVisibility] = useState("");
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  const commentInputRef = useRef();
  const navigate = useNavigate();

  const neonStyle = {
    filter: "drop-shadow(0 0 1.5px #099) drop-shadow(0 0 3px #099)",
  };

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
        const profileRes = await axios.get("/user/profile");
        setUserData(profileRes.data.user);

        const postsRes = await axios.get(
          `/post/self/${profileRes.data.user._id}`
        );
        const postsWithCounts = await Promise.all(
          postsRes.data.posts.map(async (post) => {
            const countRes = await axios.get(
              `/post/${post._id}/comments/count`
            );
            return {
              ...post,
              commentCount: countRes.data.count || 0,
            };
          })
        );
        setUserPosts(postsWithCounts || []);
      } catch (err) {
        console.error("Error:", err);
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`/post/${postId}/comments`);
      setComments(res.data.comments || []);
    } catch (error) {
      console.error("Failed to load comments", error);
      showToast("error", "Failed to Load Comments! CODE - ERRCMT1");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`/post/deletepost/${postId}`);
      setUserPosts((prev) => prev.filter((post) => post._id !== postId));
      if (selectedPost?._id === postId) {
        setSelectedPost(null);
        setCommentsModalOpen(false);
      }
      showToast("success", "Post Deleted Successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Failed to delete post"
      );
    }
  };

  const handleOpenComments = async (post) => {
    try {
      setSelectedPost({ ...post });
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
    }
  };

  const disableRightClick = (e) => e.preventDefault();

  const handleOpenPostModal = (post) => {
    setSelectedPost({ ...post });
    setCommentsModalOpen(false);
    setEditModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#172133] p-4 text-[#0bb]">
      <div className="max-w-7xl mx-auto">
        {!userData ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-cyan-400 border-t-transparent"></div>
              <p className="text-[#5599bb] text-sm sm:text-lg">
                Loading your profile...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div
              className="
  bg-[#1a2b46] rounded-3xl p-4 sm:p-6 mb-6 
  border border-[#1f2a47] shadow-subtleNeon 
  backdrop-blur-md 
  flex flex-col sm:flex-row 
  items-center sm:items-start gap-6 sm:gap-8
"
            >
              {/* Profile Image Section */}
              <div className="relative group flex-shrink-0">
                <img
                  src={userData.profileImageURL || defaultAvatar}
                  alt="Profile"
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-[#0bb] shadow-neonBtn group-hover:scale-105 transition-transform duration-300"
                  draggable={false}
                />
                <div className="absolute bottom-1 right-1 bg-green-500 border-2 border-[#172133] rounded-full w-4 h-4 md:w-5 md:h-5"></div>
                <button
                  onClick={() => navigate("/account")}
                  className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#0bb] to-[#14639d] hover:from-[#099] hover:to-[#0a4d74] text-white rounded-full p-2 sm:p-3 shadow-neonBtn transition-transform duration-200 transform hover:scale-110"
                  aria-label="Edit profile"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </div>

              {/* Profile Info Section */}
              <div className="flex-1 text-center sm:text-left space-y-3 sm:space-y-4 w-full">
                {/* Username + Verify */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center sm:justify-start">
                  <h1 className="text-[#0bb] text-2xl sm:text-3xl md:text-4xl font-bold break-words">
                    {userData.username}
                  </h1>
                  {userData.isVerified && (
                    <img
                      src={verifiedIcon}
                      alt="Verified"
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                      draggable={false}
                    />
                  )}
                </div>

                {/* Name */}
                <p className="text-[#5599bb] text-base sm:text-lg md:text-xl font-medium break-words">
                  {userData.name}
                </p>

                {/* Bio */}
                {userData.bio && (
                  <div
                    className="
        bg-[#0bb]/10 rounded-xl p-3 sm:p-4 
        border border-[#0bb]/30 
        max-w-full sm:max-w-2xl mx-auto sm:mx-0
      "
                  >
                    <p className="text-[#88bbdd] leading-relaxed text-sm sm:text-base">
                      {userData.bio}
                    </p>
                  </div>
                )}

                {/* Stats Section — now responsive grid */}
                <div
                  className="
      grid grid-cols-3 sm:flex 
      sm:justify-start sm:space-x-6 
      gap-3 sm:gap-0
      mt-4 sm:mt-6 max-w-full sm:max-w-md mx-auto sm:mx-0
    "
                >
                  <div className="text-center bg-[#0bb]/10 rounded-xl px-4 py-2 sm:px-6 sm:py-3 border border-[#0bb]/20">
                    <div className="text-xl sm:text-2xl font-bold text-[#0bb]">
                      {userData.followers?.length || 0}
                    </div>
                    <a
                      href={`/user/${userData.username}/followers`}
                      className="text-xs sm:text-sm text-[#0bb] hover:text-[#14639d] block font-semibold mt-1"
                    >
                      Followers
                    </a>
                  </div>

                  <div className="text-center bg-[#0bb]/10 rounded-xl px-4 py-2 sm:px-6 sm:py-3 border border-[#0bb]/20">
                    <div className="text-xl sm:text-2xl font-bold text-[#0bb]">
                      {userData.following?.length || 0}
                    </div>
                    <a
                      href={`/user/${userData.username}/following`}
                      className="text-xs sm:text-sm text-[#0bb] hover:text-[#14639d] block font-semibold mt-1"
                    >
                      Following
                    </a>
                  </div>

                  <div className="text-center bg-[#0bb]/10 rounded-xl px-4 py-2 sm:px-6 sm:py-3 border border-[#0bb]/20">
                    <div className="text-xl sm:text-2xl font-bold text-[#0bb]">
                      {userPosts.length}
                    </div>
                    <div className="text-xs sm:text-sm text-[#5599bb] font-semibold mt-1">
                      Posts
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Posts Section */}
            <div className="mb-8">
              <h2 className="text-[#0bb] text-3xl font-semibold mb-6 flex items-center gap-3">
                <span className="w-1 h-8 bg-[#0bb] rounded-full inline-block" />
                Your Posts
              </h2>

              {userPosts.length === 0 ? (
                <div className="text-center py-16 bg-[#0bb]/10 rounded-3xl max-w-xl mx-auto">
                  <div className="text-7xl mb-6 select-none">📸</div>
                  <p className="text-[#5599bb] text-lg">No posts yet</p>
                  <p className="text-[#446688] mt-2 text-base">
                    Share your first moment!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userPosts.map((post) => (
                    <div
                      key={post._id}
                      className="group cursor-pointer rounded-3xl overflow-hidden bg-[#172133] border border-[#1f2a47] shadow-subtleNeon transition-transform duration-300 hover:scale-[1.02] hover:shadow-neonBtn"
                      onClick={() => handleOpenPostModal(post)}
                    >
                      <div className="relative overflow-hidden">
                        {post.media[0]?.type === "image" ? (
                          <img
                            src={post.media[0].url}
                            alt="Post"
                            onContextMenu={disableRightClick}
                            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                            draggable={false}
                          />
                        ) : (
                          <video
                            src={post.media[0].url}
                            controls
                            onContextMenu={disableRightClick}
                            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[#0bb] text-sm font-semibold select-none">
                          <span className="flex items-center gap-2 bg-black/30 rounded-2xl px-3 py-1">
                            💬 {post.commentCount || 0}
                          </span>
                          <span className="rounded-2xl bg-black/30 px-3 py-1">
                            {post.visibility}
                          </span>
                        </div>
                      </div>
                      {post.caption && (
                        <div className="p-4">
                          <p className="text-[#5599bb] text-sm line-clamp-2 leading-snug">
                            {post.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedPost && !commentsModalOpen && !editModalOpen && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#172133] border border-[#0bb] rounded-3xl shadow-neonBtn max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
                  {/* Media Section */}
                  <div className="md:flex-1 bg-black flex items-center justify-center rounded-l-3xl min-h-[40vh] md:min-h-auto">
                    {selectedPost.media[0]?.type === "image" ? (
                      <img
                        src={selectedPost.media[0].url}
                        alt="Post"
                        className="max-w-full max-h-[80vh] object-contain"
                        onContextMenu={disableRightClick}
                        draggable={false}
                      />
                    ) : (
                      <video
                        src={selectedPost.media[0].url}
                        controls
                        className="max-w-full max-h-[80vh] object-contain"
                        onContextMenu={disableRightClick}
                      />
                    )}
                  </div>
                  {/* Content Section */}
                  <div className="md:w-96 p-6 overflow-y-auto bg-[#1a2b46] flex flex-col gap-6 rounded-r-3xl text-left">
                    <div>
                      <h3 className="text-[#0bb] text-xl font-semibold mb-3">
                        {selectedPost.caption || "No caption"}
                      </h3>
                    </div>

                    {Array.isArray(selectedPost.tags) &&
                      selectedPost.tags.length > 0 && (
                        <div>
                          <div className="flex flex-wrap gap-2">
                            {selectedPost.tags.map((tag, idx) => (
                              <a
                                key={tag._id || idx}
                                href={`/user/${
                                  typeof tag === "object" ? tag.username : tag
                                }`}
                                className="text-[#0bb] bg-[#14639d]/20 px-3 py-1 rounded-xl text-sm hover:bg-[#14639d]/40 transition"
                              >
                                @{typeof tag === "object" ? tag.username : tag}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                    {selectedPost.location && (
                      <div>
                        <p className="text-[#5599bb] flex items-center gap-1 whitespace-pre-wrap">
                          📍 {selectedPost.location}
                        </p>
                      </div>
                    )}

                    <div className="border-t border-[#0bb]/50 pt-4 flex flex-col gap-4">
                      <div className="flex justify-between items-center flex-wrap gap-4">
                        <button
                          onClick={() => handleOpenComments(selectedPost)}
                          className="inline-flex items-center gap-2 text-[#0bb] hover:text-[#14639d] font-medium"
                        >
                          <img
                            src={commentIcon}
                            alt="Comments"
                            className="w-5 h-5"
                          />
                          {selectedPost.commentCount || 0}
                        </button>

                        <span className="bg-[#0bb]/30 px-3 py-1 rounded-xl text-sm">
                          {selectedPost.visibility}
                        </span>
                      </div>

                      <div className="flex gap-4 flex-wrap">
                        {(selectedPost.authorId?._id ||
                          selectedPost.authorId) === userData._id && (
                          <>
                            <button
                              onClick={() => {
                                setEditCaption(selectedPost.caption);
                                setEditVisibility(selectedPost.visibility);
                                setEditModalOpen(true);
                                setCommentsModalOpen(false);
                              }}
                              className="flex-1 px-4 py-3 rounded-xl bg-[#0bb] hover:bg-[#14639d] text-white font-semibold transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePost(selectedPost._id)}
                              className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedPost(null)}
                          className="flex-1 px-4 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Modal */}
            {editModalOpen && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#172133] border border-[#0bb] rounded-3xl shadow-neonBtn w-full max-w-md">
                  <div className="p-6">
                    <h3 className="text-[#0bb] text-2xl font-bold mb-6 flex items-center gap-3">
                      <span className="w-1 h-6 bg-[#0bb] rounded-full inline-block" />
                      Edit Post
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[#5599bb] font-semibold mb-2 text-sm">
                          Caption
                        </label>
                        <textarea
                          className="w-full bg-[#1a2b46] border border-[#0bb] rounded-xl p-3 text-[#0bb] resize-none focus:outline-none focus:ring-2 focus:ring-[#0bb] transition text-sm"
                          rows="4"
                          value={editCaption}
                          onChange={(e) => {
                            setEditCaption(e.target.value);
                            setIsSaveEnabled(true);
                          }}
                          placeholder="Write a caption..."
                        />
                      </div>
                      <div>
                        <label className="block text-[#5599bb] font-semibold mb-2 text-sm">
                          Visibility
                        </label>
                        <select
                          className="w-full bg-[#1a2b46] border border-[#0bb] rounded-xl p-3 text-[#0bb] focus:outline-none focus:ring-2 focus:ring-[#0bb] transition text-sm"
                          value={editVisibility}
                          onChange={(e) => {
                            setEditVisibility(e.target.value);
                            setIsSaveEnabled(true);
                          }}
                        >
                          <option value="public">🌍 Public</option>
                          <option value="followers">👥 Followers Only</option>
                          <option value="private">🔒 Private</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                      <button
                        className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white transition ${
                          isSaveEnabled
                            ? "bg-[#0bb] hover:bg-[#14639d]"
                            : "bg-gray-700 cursor-not-allowed"
                        }`}
                        disabled={!isSaveEnabled}
                        onClick={async () => {
                          try {
                            await axios.put(`/post/${selectedPost._id}/edit`, {
                              caption: editCaption,
                              visibility: editVisibility,
                            });
                            const updatedPosts = userPosts.map((post) =>
                              post._id === selectedPost._id
                                ? {
                                    ...post,
                                    caption: editCaption,
                                    visibility: editVisibility,
                                  }
                                : post
                            );
                            setUserPosts(updatedPosts);
                            setSelectedPost((prev) => ({
                              ...prev,
                              caption: editCaption,
                              visibility: editVisibility,
                            }));
                            setEditModalOpen(false);
                            setIsSaveEnabled(false);
                            showToast("success", "Post Updated Successfully!");
                          } catch (error) {
                            console.error("Update failed:", error);
                            showToast(
                              "error",
                              error?.response?.data?.message ||
                                "Failed to update post"
                            );
                          }
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        className="flex-1 px-4 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition"
                        onClick={() => {
                          setEditModalOpen(false);
                          setIsSaveEnabled(false);
                        }}
                      >
                        Cancel
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
                  <main className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#0bb]/50 scrollbar-track-transparent text-[#5599bb]">
                    {comments.length === 0 ? (
                      <div className="text-center italic">
                        No comments yet. Be the first!
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div
                          key={comment._id}
                          className="flex gap-4 items-start"
                        >
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
                                />
                              )}
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </main>
                  <footer className="p-4 border-t border-[#0bb] flex gap-2 bg-[#172133]">
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
                      <img
                        src={commentIcon}
                        alt="Send comment"
                        className="w-5 h-5"
                      />
                    </button>
                  </footer>
                </div>
              </div>
            )}
          </>
        )}

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-subtleNeon backdrop-blur-md max-w-xs sm:max-w-sm ${
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
              ></div>
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Neon shadows */}
      <style>{`
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

export default Profile;
