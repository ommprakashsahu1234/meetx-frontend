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
  const [checkingAuth, setCheckingAuth] = useState(true);

  const navigate = useNavigate();

  const MAX_FILE_SIZE = 15 * 1024 * 1024;
  const neonStyle = {
    filter: "drop-shadow(0 0 1.5px #099) drop-shadow(0 0 3px #099)",
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setCheckingAuth(false);
    else navigate("/login");
  }, [navigate]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

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
          { ratio: 1, tolerance: 0.1 },
          { ratio: 16 / 9, tolerance: 0.1 },
          { ratio: 4 / 3, tolerance: 0.1 },
          { ratio: 3 / 4, tolerance: 0.1 },
        ];
        const isAllowed = allowedRatios.some(
          (a) => Math.abs(aspectRatio - a.ratio) <= a.tolerance
        );
        if (isAllowed) resolve({ allowed: true });
        else
          reject({ message: `Unsupported aspect ratio (${width}x${height}).` });
      };
      video.onerror = () => reject({ message: "Error loading video file." });
      video.src = URL.createObjectURL(file);
    });
  };

  const handleMediaChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      showToast(
        "error",
        `File too large (${formatFileSize(file.size)}). Max 15 MB.`
      );
      return;
    }
    const type = file.type.startsWith("image")
      ? "image"
      : file.type.startsWith("video")
      ? "video"
      : "";
    if (!type) {
      showToast("error", "Only images/videos allowed.");
      return;
    }
    if (type === "video") {
      try {
        await checkVideoAspectRatio(file);
        setMedia(file);
        setMediaType(type);
        setPreview(URL.createObjectURL(file));
      } catch (err) {
        showToast("error", err.message);
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
    } catch {}
  };

  const handleTagSelect = (user) => {
    if (!taggedUsers.find((u) => u._id === user._id)) {
      setTaggedUsers([...taggedUsers, user]);
    }
    setTagInput("");
    setUserSuggestions([]);
  };

  const removeTag = (id) => {
    setTaggedUsers(taggedUsers.filter((u) => u._id !== id));
  };

  const handleSubmit = async () => {
    if (!media || !mediaType) return showToast("error", "Upload media first.");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("media", media);
      const uploadRes = await axios.post("/post/upload?type=post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { url: mediaURL, fileId } = uploadRes.data;
      await axios.post("/post/create", {
        caption,
        tags: JSON.stringify(taggedUsers.map((u) => u._id)),
        location,
        visibility,
        mediaType,
        mediaURL,
        fileId,
      });
      showToast("success", "Post Created Successfully!");
      setMedia(null);
      setMediaType("");
      setPreview(null);
      setCaption("");
      setLocation("");
      setVisibility("public");
      setTaggedUsers([]);
      setTagInput("");
    } catch (err) {
      const msg = err.response?.data?.message;
      showToast("error", msg || "Upload Failed!");
    } finally {
      setLoading(false);
    }
  };

  const getVisibilityIcon = () => {
    switch (visibility) {
      case "public":
        return <Globe className="w-4 h-4" style={neonStyle} />;
      case "followers":
        return <Users className="w-4 h-4" style={neonStyle} />;
      case "private":
        return <Lock className="w-4 h-4" style={neonStyle} />;
      default:
        return <Globe className="w-4 h-4" style={neonStyle} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#172133] p-4 text-[#0bb]">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-6 shadow-subtleNeon flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-[#0bb] to-[#145279] rounded-2xl shadow-subtleNeonBtn">
            <Camera className="text-white" style={neonStyle} />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0bb] to-[#145279] bg-clip-text text-transparent">
              Create Post
            </h1>
            <p className="text-[#5588aa]">Share your moments with the world</p>
          </div>
        </div>

        {/* Media Guidelines */}
        <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-4 shadow-subtleNeon">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-[#0bb]" style={neonStyle} />
            <div className="text-[#4488bb] text-sm space-y-1">
              <p>• Max 15 MB file size</p>
              <p>• Any image format supported</p>
              <p>• Videos must be 1:1, 4:3, 3:4 or 16:9</p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-6 shadow-subtleNeon">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="text-[#0bb]" style={neonStyle} />
            <h2 className="text-lg font-semibold">Upload Media</h2>
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
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#1f2a47] rounded-2xl hover:border-[#0bb] transition bg-[#1a2b46]/30 cursor-pointer"
            >
              <Upload
                className="w-8 h-8 text-[#4488bb] mb-4"
                style={neonStyle}
              />
              <p className="text-[#0bb] text-lg font-medium">
                {media ? "Change Media" : "Choose a file"}
              </p>
              <p className="text-[#5588aa] text-sm">Images/videos up to 15MB</p>
            </label>
          </div>
          {preview && (
            <div className="mt-6 relative border border-[#1f2a47] rounded-2xl overflow-hidden">
              {mediaType === "image" ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full object-cover"
                />
              ) : (
                <video src={preview} controls className="w-full object-cover" />
              )}
              <div className="absolute top-4 left-4 bg-[#11202a]/80 px-3 py-1 rounded-full border border-[#1f2a47] flex items-center gap-1">
                {mediaType === "image" ? (
                  <ImageIcon
                    className="w-4 h-4 text-[#0bb]"
                    style={neonStyle}
                  />
                ) : (
                  <Video className="w-4 h-4 text-[#0bb]" style={neonStyle} />
                )}
                <span className="text-xs capitalize">{mediaType}</span>
              </div>
              <div className="absolute top-4 right-4 bg-[#11202a]/80 px-3 py-1 rounded-full border border-[#1f2a47] text-xs">
                {formatFileSize(media.size)}
              </div>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-6 shadow-subtleNeon">
          <div className="flex items-center gap-3 mb-4">
            <Type className="text-[#0bb]" style={neonStyle} />
            <h2 className="text-lg font-semibold">Caption</h2>
          </div>
          <textarea
            className="w-full p-4 bg-[#1a2b46] border-2 border-[#1f2a47] text-[#0bb] rounded-2xl focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/30"
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-[#5588aa] mt-2">
            <span>Express yourself</span>
            <span>{caption.length}/500</span>
          </div>
        </div>

        {/* Location & Visibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#172133] border border-[#1f2a47] p-6 rounded-3xl shadow-subtleNeon">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-[#0bb]" style={neonStyle} />
              <h2 className="text-lg font-semibold">Location</h2>
            </div>
            <input
              type="text"
              className="w-full p-4 bg-[#1a2b46] border-2 border-[#1f2a47] text-[#0bb] rounded-2xl focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/30"
              placeholder="Add location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="bg-[#172133] border border-[#1f2a47] p-6 rounded-3xl shadow-subtleNeon">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-[#0bb]" style={neonStyle} />
              <h2 className="text-lg font-semibold">Visibility</h2>
            </div>
            <div className="relative">
              <select
                className="w-full p-4 bg-[#1a2b46] border-2 border-[#1f2a47] text-[#0bb] rounded-2xl focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/30 appearance-none"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="public">Public</option>
                <option value="followers">Followers Only</option>
                <option value="private">Private</option>
              </select>
              <div className="absolute top-1/2 right-4 -translate-y-1/2">
                {getVisibilityIcon()}
              </div>
            </div>
          </div>
        </div>

        {/* Tag People */}
        <div className="bg-[#172133] border border-[#1f2a47] p-6 rounded-3xl shadow-subtleNeon">
          <div className="flex items-center gap-3 mb-4">
            <Tag className="text-[#0bb]" style={neonStyle} />
            <h2 className="text-lg font-semibold">Tag People</h2>
          </div>
          <input
            className="w-full p-4 bg-[#1a2b46] border-2 border-[#1f2a47] text-[#0bb] rounded-2xl focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/30"
            placeholder="Search and tag users..."
            value={tagInput}
            onChange={(e) => handleTagSearch(e.target.value)}
          />
          {userSuggestions.length > 0 && (
            <div className="mt-2 bg-[#1a2b46] border border-[#1f2a47] rounded-2xl overflow-hidden">
              {userSuggestions.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleTagSelect(u)}
                  className="px-4 py-2 hover:bg-[#273b62] cursor-pointer"
                >
                  @{u.username}
                </div>
              ))}
            </div>
          )}
          {taggedUsers.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {taggedUsers.map((u) => (
                <span
                  key={u._id}
                  className="px-3 py-1 bg-[#1a2b46] border border-[#0bb] rounded-xl text-[#0bb] flex items-center gap-1"
                >
                  @{u.username}
                  <button onClick={() => removeTag(u._id)}>
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !media}
          className="w-full py-4 bg-gradient-to-r from-[#0bb] to-[#145279] text-white rounded-2xl shadow-subtleNeonBtn hover:from-[#099] hover:to-[#0a4d74] hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Create Post</span>
            </>
          )}
        </button>
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-50">
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
              <span>{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .shadow-subtleNeon { box-shadow: 0 0 2px #099, 0 0 6px #0992 }
        .shadow-subtleNeonBtn { box-shadow: 0 0 2px #0993; }
      `}</style>
    </div>
  );
}

export default CreatePost;
