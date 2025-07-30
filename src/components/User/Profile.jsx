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
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likesList, setLikesList] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCaption, setEditCaption] = useState("");
  const [editVisibility, setEditVisibility] = useState("");
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

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

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`/post/deletepost/${postId}`);

      setUserPosts((prev) => prev.filter((post) => post._id !== postId));
      if (selectedPost?._id === postId) {
        setSelectedPost(null);
        setLikesModalOpen(false);
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
      const res = await axios.post(`/post/${selectedPost._id}/comment`, {
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

  const handleLikeToggle = async (postId, liked) => {
    try {
      await axios.post(`/post/${postId}/${liked ? "unlike" : "like"}`);

      const updatedPosts = userPosts.map((p) =>
        p._id === postId
          ? {
              ...p,
              likedByUser: !liked,
              likes: liked
                ? p.likes.filter((id) => id !== userData._id)
                : [...p.likes, userData._id],
            }
          : p
      );
      setUserPosts(updatedPosts);

      if (selectedPost && selectedPost._id === postId) {
        const updatedSelected = {
          ...selectedPost,
          likedByUser: !liked,
          likes: liked
            ? selectedPost.likes.filter((id) => id !== userData._id)
            : [...selectedPost.likes, userData._id],
        };
        setSelectedPost(updatedSelected);
      }
    } catch (e) {
      console.error("Like toggle failed:", e);
    }
  };

  const disableRightClick = (e) => e.preventDefault();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {!userData ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-400"></div>
              <p className="text-gray-300 text-sm sm:text-lg">Loading your profile...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced Profile Header */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-2xl border border-white/10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 lg:gap-8">
                {/* Profile Image Section */}
                <div className="relative group flex-shrink-0">
                  <div className="relative">
                    <img
                      src={userData.profileImageURL || defaultAvatar}
                      alt="Profile"
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-blue-400 shadow-xl group-hover:scale-105 transition-all duration-300"
                      draggable={false}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Edit Profile Button */}
                  <button
                    onClick={() => navigate("/account")}
                    className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full p-2 sm:p-3 shadow-lg transition-all duration-200 transform hover:scale-110 group"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      <span className="hidden sm:inline">Edit Profile</span>
                      <span className="sm:hidden">Edit</span>
                    </div>
                  </button>
                </div>
                
                {/* Profile Info Section */}
                <div className="flex-1 text-center sm:text-left space-y-3 sm:space-y-4 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2 sm:gap-3">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white break-words">
                      {userData.username}
                    </h1>
                    {userData.isVerified && (
                      <img
                        src={verifiedIcon}
                        alt="Verified"
                        className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 mx-auto sm:mx-0"
                        draggable={false}
                      />
                    )}
                  </div>
                  
                  <p className="text-blue-300 text-base sm:text-lg md:text-xl font-medium break-words">
                    {userData.name}
                  </p>
                  
                  {userData.bio && (
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-white/10">
                      <p className="text-gray-200 text-sm sm:text-base leading-relaxed max-w-2xl break-words">
                        {userData.bio}
                      </p>
                    </div>
                  )}
                  
                  {/* Stats Section */}
                  <div className="flex justify-center sm:justify-start space-x-4 sm:space-x-6 md:space-x-8 mt-4 sm:mt-6">
                    <div className="text-center bg-white/5 rounded-xl px-3 sm:px-4 py-2 sm:py-3 backdrop-blur-sm border border-white/10">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                        {userData.followers?.length || 0}
                      </div>
                      <a 
                        href={`/user/${userData.username}/followers`} 
                        className="text-blue-300 hover:text-blue-200 transition-colors font-medium text-xs sm:text-sm block"
                      >
                        Followers
                      </a>
                    </div>
                    <div className="text-center bg-white/5 rounded-xl px-3 sm:px-4 py-2 sm:py-3 backdrop-blur-sm border border-white/10">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                        {userData.following?.length || 0}
                      </div>
                      <a 
                        href={`/user/${userData.username}/following`} 
                        className="text-blue-300 hover:text-blue-200 transition-colors font-medium text-xs sm:text-sm block"
                      >
                        Following
                      </a>
                    </div>
                    <div className="text-center bg-white/5 rounded-xl px-3 sm:px-4 py-2 sm:py-3 backdrop-blur-sm border border-white/10">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                        {userPosts.length}
                      </div>
                      <div className="text-gray-300 font-medium text-xs sm:text-sm">
                        Posts
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Posts Grid */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
                <span className="w-1 h-6 sm:h-8 bg-blue-400 rounded-full"></span>
                <span>Your Posts</span>
              </h2>
              
              {userPosts.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10">
                  <div className="text-4xl sm:text-6xl mb-4">📸</div>
                  <p className="text-gray-300 text-lg sm:text-xl">No posts yet</p>
                  <p className="text-gray-400 mt-2 text-sm sm:text-base">Share your first moment!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {userPosts.map((post) => (
                    <div
                      key={post._id}
                      className="group bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-white/10 hover:border-blue-400/50"
                    >
                      <div
                        className="relative cursor-pointer overflow-hidden"
                        onClick={() =>
                          setSelectedPost({
                            ...post,
                            likedByUser: post.likes.includes(userData._id),
                          })
                        }
                      >
                        {post.media[0]?.type === "image" ? (
                          <img
                            src={post.media[0].url}
                            alt="Post"
                            onContextMenu={disableRightClick}
                            className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                            draggable={false}
                          />
                        ) : (
                          <video
                            src={post.media[0].url}
                            onContextMenu={disableRightClick}
                            className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                            controls
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                                ❤️ {post.likes?.length || 0}
                              </span>
                              <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                                💬 {post.commentCount || 0}
                              </span>
                            </div>
                            <span className="bg-black/50 px-2 py-1 rounded-full text-xs">
                              {post.visibility}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {post.caption && (
                        <div className="p-3 sm:p-4">
                          <p className="text-gray-200 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                            {post.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Post Modal */}
            {selectedPost && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl border border-white/10">
                  <div className="flex flex-col lg:flex-row h-full max-h-[95vh] sm:max-h-[90vh]">
                    {/* Media Section */}
                    <div className="lg:flex-1 bg-black/50 rounded-l-2xl sm:rounded-l-3xl flex items-center justify-center min-h-[40vh] lg:min-h-auto">
                      {selectedPost.media[0]?.type === "image" ? (
                        <img
                          src={selectedPost.media[0].url}
                          alt="Post"
                          className="max-w-full max-h-[40vh] sm:max-h-[60vh] lg:max-h-[80vh] object-contain"
                          onContextMenu={disableRightClick}
                          draggable={false}
                        />
                      ) : (
                        <video
                          src={selectedPost.media[0].url}
                          controls
                          className="max-w-full max-h-[40vh] sm:max-h-[60vh] lg:max-h-[80vh] object-contain"
                          onContextMenu={disableRightClick}
                        />
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="lg:w-80 xl:w-96 p-4 sm:p-6 overflow-y-auto">
                      <div className="space-y-3 sm:space-y-4">
                        {/* Caption */}
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Caption</h3>
                          <p className="text-gray-300 leading-relaxed text-sm sm:text-base break-words">
                            {selectedPost.caption || "No caption"}
                          </p>
                        </div>

                        {/* Tags */}
                        {Array.isArray(selectedPost.tags) && selectedPost.tags.length > 0 && (
                          <div>
                            <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-2">Tagged People</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedPost.tags.map((tag, i) => (
                                <a
                                  key={tag._id || i}
                                  href={`/user/${tag.username}`}
                                  className="bg-blue-600/20 text-blue-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm hover:bg-blue-600/30 transition-colors"
                                >
                                  @{typeof tag === "object" ? tag.username : tag}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Location */}
                        {selectedPost.location && (
                          <div>
                            <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-1">Location</h4>
                            <p className="text-gray-300 flex items-center gap-1 text-sm break-words">
                              📍 {selectedPost.location}
                            </p>
                          </div>
                        )}

                        {/* Stats and Actions */}
                        <div className="border-t border-gray-700 pt-3 sm:pt-4">
                          <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                            <div className="flex items-center gap-2 sm:gap-4">
                              <button
                                className="flex items-center gap-2 hover:scale-110 transition-transform"
                                onClick={() =>
                                  handleLikeToggle(
                                    selectedPost._id,
                                    selectedPost.likedByUser
                                  )
                                }
                              >
                                <img
                                  src={
                                    selectedPost.likedByUser
                                      ? heartFilled
                                      : heartOutline
                                  }
                                  className="w-5 h-5 sm:w-6 sm:h-6"
                                  alt="like"
                                  draggable={false}
                                />
                              </button>

                              <button
                                className="text-white hover:text-blue-400 transition-colors font-medium text-xs sm:text-sm"
                                onClick={() => handleOpenLikes(selectedPost)}
                              >
                                {selectedPost.likes?.length || 0} Likes
                              </button>

                              <button
                                className="flex items-center gap-1 sm:gap-2 text-white hover:text-blue-400 transition-colors font-medium text-xs sm:text-sm"
                                onClick={() => handleOpenComments(selectedPost)}
                              >
                                <img
                                  src={commentIcon}
                                  className="w-4 h-4 sm:w-5 sm:h-5"
                                  alt="comments"
                                  draggable={false}
                                />
                                {selectedPost.commentCount || 0}
                              </button>
                            </div>

                            <span className="bg-gray-700/50 px-2 sm:px-3 py-1 rounded-full text-xs text-gray-300">
                              {selectedPost.visibility}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex gap-2 sm:gap-3">
                              <button
                                onClick={() => {
                                  setEditCaption(selectedPost.caption);
                                  setEditVisibility(selectedPost.visibility);
                                  setEditModalOpen(true);
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded-lg transition-colors font-medium text-xs sm:text-sm"
                              >
                                Edit Post
                              </button>
                              
                              {(selectedPost.authorId?._id || selectedPost.authorId) === userData._id && (
                                <button
                                  onClick={() => handleDeletePost(selectedPost._id)}
                                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 sm:px-4 rounded-lg transition-colors font-medium text-xs sm:text-sm"
                                >
                                  Delete
                                </button>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                setSelectedPost(null);
                                setLikesModalOpen(false);
                                setCommentsModalOpen(false);
                              }}
                              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 sm:px-4 rounded-lg transition-colors font-medium text-xs sm:text-sm"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Edit Modal */}
            {editModalOpen && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
                <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl border border-white/10">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
                      <span className="w-1 h-5 sm:h-6 bg-blue-400 rounded-full"></span>
                      <span>Edit Post</span>
                    </h3>

                    <div className="space-y-4 sm:space-y-5">
                      <div>
                        <label className="block text-gray-300 font-medium mb-2 text-sm sm:text-base">Caption</label>
                        <textarea
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm sm:text-base"
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
                        <label className="block text-gray-300 font-medium mb-2 text-sm sm:text-base">Visibility</label>
                        <select
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm sm:text-base"
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

                    <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-8">
                      <button
                        className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-medium transition-all text-sm sm:text-base ${
                          isSaveEnabled
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
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
                              error?.response?.data?.message || "Failed to update post"
                            );
                          }
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        className="bg-gray-700 hover:bg-gray-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-medium transition-colors text-sm sm:text-base"
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

            {/* Enhanced Likes Modal */}
            {likesModalOpen && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
                <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[80vh] shadow-2xl border border-white/10">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-3">
                      <span className="text-red-500">❤️</span>
                      <span>Liked by ({likesList.length})</span>
                    </h3>
                    
                    <div className="overflow-y-auto max-h-60 sm:max-h-80 space-y-2 sm:space-y-3">
                      {likesList.length === 0 ? (
                        <p className="text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">No likes yet</p>
                      ) : (
                        likesList.map((like) => (
                          <div key={like._id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <img
                              src={like.user?.profileImageURL || defaultAvatar}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-600"
                              alt={like.user?.username}
                              draggable={false}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white text-sm sm:text-base truncate">@{like.user?.username}</span>
                                {like.user?.isVerified && (
                                  <img
                                    src={verifiedIcon}
                                    alt="Verified"
                                    className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                                    draggable={false}
                                  />
                                )}
                              </div>
                              {like.user?.name && (
                                <p className="text-gray-400 text-xs sm:text-sm truncate">{like.user.name}</p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPost(null);
                        setLikesModalOpen(false);
                        setCommentsModalOpen(false);
                      }}
                      className="w-full mt-4 sm:mt-6 bg-gray-700 hover:bg-gray-600 text-white py-2 sm:py-3 rounded-xl font-medium transition-colors text-sm sm:text-base"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Comments Modal */}
            {commentsModalOpen && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
                <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] shadow-2xl border border-white/10 flex flex-col">
                  <div className="p-4 sm:p-6 border-b border-gray-700">
                    <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
                      <span>💬</span>
                      <span>Comments ({comments.length})</span>
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <div className="text-3xl sm:text-4xl mb-2">💭</div>
                        <p className="text-gray-400 text-sm sm:text-base">No comments yet</p>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">Be the first to comment!</p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment._id} className="flex gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-white/5 rounded-lg transition-colors">
                          <img
                            src={comment.user?.profileImageURL || defaultAvatar}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-600 flex-shrink-0"
                            alt="commenter"
                            draggable={false}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-blue-300 text-sm sm:text-base truncate">@{comment.user?.username}</span>
                              {comment.user?.isVerified && (
                                <img
                                  src={verifiedIcon}
                                  alt="Verified"
                                  className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                                  draggable={false}
                                />
                              )}
                            </div>
                            <p className="text-gray-300 leading-relaxed text-sm sm:text-base break-words">{comment.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-4 sm:p-6 border-t border-gray-700">
                    <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <input
                        ref={commentInputRef}
                        type="text"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm sm:text-base"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      />
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-colors text-sm sm:text-base"
                        onClick={handleAddComment}
                      >
                        Send
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPost(null);
                        setLikesModalOpen(false);
                        setCommentsModalOpen(false);
                      }}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 sm:py-3 rounded-xl font-medium transition-colors text-sm sm:text-base"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Enhanced Toast Notifications */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl text-white font-medium transform transition-all duration-300 max-w-xs sm:max-w-sm ${
              toast.type === "success" 
                ? "bg-gradient-to-r from-green-600 to-green-500" 
                : "bg-gradient-to-r from-red-600 to-red-500"
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-base sm:text-xl">
                {toast.type === "success" ? "✅" : "❌"}
              </span>
              <span className="text-xs sm:text-sm break-words">{toast.message}</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @media (max-width: 640px) {
          .max-h-\[95vh\] {
            max-height: 95vh;
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;
