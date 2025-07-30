import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Image as ImageIcon,
  Video,
  MapPin,
  Users,
  Eye,
  Lock,
  Globe,
  X,
  Camera,
  Type,
  Tag,
  Send,
  AlertTriangle,
} from "lucide-react";

function CreatePost() {
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [toast, setToast] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [tagInput, setTagInput] = useState("");
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const MAX_FILE_SIZE = 15 * 1024 * 1024;

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
    if (token) {
      setCheckingAuth(false);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (checkingAuth) return null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const checkVideoAspectRatio = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);

        const width = video.videoWidth;
        const height = video.videoHeight;
        const aspectRatio = width / height;

        const allowedRatios = [
          { ratio: 1, name: "1:1 (Square)", tolerance: 0.1 },
          { ratio: 16 / 9, name: "16:9 (Landscape)", tolerance: 0.1 },
          { ratio: 4 / 3, name: "4:3 (Standard)", tolerance: 0.1 },
          { ratio: 3 / 4, name: "3:4 (Portrait)", tolerance: 0.1 },
        ];

        const isAllowed = allowedRatios.some(
          (allowed) =>
            Math.abs(aspectRatio - allowed.ratio) <= allowed.tolerance
        );

        if (isAllowed) {
          resolve({ width, height, aspectRatio, allowed: true });
        } else {
          reject({
            width,
            height,
            aspectRatio,
            allowed: false,
            message: `Video aspect ratio (${width}x${height}) is not supported. Please use 1:1, 4:3, 3:4, or 16:9 aspect ratios.`,
          });
        }
      };

      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject({ message: "Error loading video file." });
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleMediaChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      showToast(
        "error",
        `File size (${formatFileSize(
          file.size
        )}) exceeds the 15 MB limit. Please choose a smaller file.`
      );
      return;
    }

    const type = file.type.startsWith("image")
      ? "image"
      : file.type.startsWith("video")
      ? "video"
      : "";

    if (!type) {
      showToast("error", "Only Images and Videos are allowed.");
      return;
    }

    if (type === "video") {
      try {
        await checkVideoAspectRatio(file);
        setMedia(file);
        setMediaType(type);
        setPreview(URL.createObjectURL(file));
      } catch (error) {
        showToast("error", error.message);
        return;
      }
    } else {
      setMedia(file);
      setMediaType(type);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleTagSearch = async (text) => {
    setTagInput(text);
    if (!text) return setUserSuggestions([]);

    try {
      const res = await axios.get(`/post/search-usernames?q=${text}`);
      setUserSuggestions(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleTagSelect = (user) => {
    if (!taggedUsers.find((u) => u._id === user._id)) {
      setTaggedUsers([...taggedUsers, user]);
    }
    setTagInput("");
    setUserSuggestions([]);
  };

  const removeTag = (userId) => {
    setTaggedUsers(taggedUsers.filter((u) => u._id !== userId));
  };

  const handleSubmit = async () => {
    if (!media || !mediaType) return showToast("error", "Upload Media First.");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("media", media);

      const uploadRes = await axios.post("/post/upload?type=post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { url: mediaURL, fileId } = uploadRes.data;

      const res = await axios.post("/post/create", {
        caption,
        tags: JSON.stringify(taggedUsers.map((u) => u._id)),
        location,
        visibility,
        mediaType,
        mediaURL,
        fileId,
      });

      showToast("success", "Post Created Successfully!");
      console.log(res.data);

      setMedia(null);
      setMediaType("");
      setPreview(null);
      setCaption("");
      setLocation("");
      setVisibility("public");
      setTaggedUsers([]);
      setUserSuggestions([]);
      setTagInput("");
    } catch (err) {
      console.error("Post upload failed", err);
      const msg = err.response?.data?.message;

      if (msg === "Invalid or corrupted image file.") {
        showToast("error", "Upload a Valid Image File.");
      } else if (msg) {
        showToast("error", msg);
      } else {
        showToast("error", "Upload Failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  const getVisibilityIcon = () => {
    switch (visibility) {
      case "public":
        return <Globe className="w-4 h-4" />;
      case "followers":
        return <Users className="w-4 h-4" />;
      case "private":
        return <Lock className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Create Post
                </h1>
                <p className="text-gray-400">
                  Share your moments with the world
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-blue-300 font-medium mb-2">
                  Media Guidelines
                </h3>
                <div className="text-blue-200 text-sm space-y-1">
                  <p>
                    • <strong>File Size:</strong> Maximum 15 MB for all files
                  </p>
                  <p>
                    • <strong>Images:</strong> All formats supported
                  </p>
                  <p>
                    • <strong>Videos:</strong> Must use proper aspect ratios
                  </p>
                  <p>
                    • <strong>Supported ratios:</strong> 1:1 (Square), 4:3
                    (Standard), 3:4 (Portrait), 16:9 (Landscape)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-gray-100">
                Upload Media
              </h2>
            </div>

            <div className="relative group">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="media-upload"
              />
              <label
                htmlFor="media-upload"
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-2xl hover:border-cyan-500 transition-all duration-300 cursor-pointer group-hover:bg-gray-700/30"
              >
                <div className="p-4 bg-gray-700 rounded-full mb-4 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-blue-600 transition-all duration-300">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-white" />
                </div>
                <p className="text-gray-300 text-lg font-medium mb-2">
                  {media ? "Change Media" : "Choose a file"}
                </p>
                <p className="text-gray-500 text-sm">
                  Images and videos up to 15 MB
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Videos: 1:1, 4:3, 3:4, 16:9 ratios only
                </p>
              </label>
            </div>

            {preview && (
              <div className="mt-6">
                <div className="relative">
                  <div
                    className={`${
                      mediaType === "image" ? "aspect-[4/3]" : "aspect-[16/9]"
                    } w-full bg-black overflow-hidden rounded-2xl border-2 border-gray-600`}
                  >
                    {mediaType === "image" ? (
                      <img
                        src={preview}
                        alt="preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <video
                        src={preview}
                        controls
                        controlsList="nodownload"
                        draggable={false}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-gray-900/80 backdrop-blur-md rounded-full border border-gray-600">
                    <div className="flex items-center gap-2">
                      {mediaType === "image" ? (
                        <ImageIcon className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Video className="w-4 h-4 text-cyan-400" />
                      )}
                      <span className="text-white text-sm font-medium capitalize">
                        {mediaType}
                      </span>
                    </div>
                  </div>
                  {media && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-gray-900/80 backdrop-blur-md rounded-full border border-gray-600">
                      <span className="text-white text-xs font-medium">
                        {formatFileSize(media.size)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <Type className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-gray-100">Caption</h2>
            </div>
            <textarea
              className="w-full p-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 resize-none min-h-[120px]"
              placeholder="Write a caption for your post..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-500 text-sm">Express yourself</span>
              <span className="text-gray-500 text-sm">
                {caption.length}/500
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-gray-100">Location</h2>
            </div>
            <input
              type="text"
              className="w-full p-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
              placeholder="Add location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-gray-100">
                Visibility
              </h2>
            </div>
            <div className="relative">
              <select
                className="w-full p-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 appearance-none cursor-pointer"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="public">Public</option>
                <option value="followers">Followers Only</option>
                <option value="private">Private</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {getVisibilityIcon()}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <Tag className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-gray-100">
                Tag People
              </h2>
            </div>

            <div className="relative">
              <input
                type="text"
                className="w-full p-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                placeholder="Search and tag users..."
                value={tagInput}
                onChange={(e) => handleTagSearch(e.target.value)}
              />

              {userSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-700 border border-gray-600 rounded-2xl shadow-2xl z-20 max-h-48 overflow-y-auto">
                  {userSuggestions.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleTagSelect(user)}
                      className="px-4 py-3 hover:bg-gray-600 cursor-pointer transition-colors duration-300 first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-600 last:border-b-0"
                    >
                      <span className="text-gray-100">@{user.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {taggedUsers.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-3">Tagged users:</p>
                <div className="flex flex-wrap gap-2">
                  {taggedUsers.map((user) => (
                    <span
                      key={user._id}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 text-sm font-medium"
                    >
                      @{user.username}
                      <button
                        onClick={() => removeTag(user._id)}
                        className="text-cyan-400 hover:text-red-400 transition-colors duration-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <button
            onClick={handleSubmit}
            disabled={loading || !media}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Post...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Create Post</span>
              </>
            )}
          </button>
        </div>
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

export default CreatePost;
