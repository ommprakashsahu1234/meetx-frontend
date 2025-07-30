import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Send,
  Eye,
  RotateCcw,
  Bell,
  Users,
  MessageSquare,
  Zap,
  ArrowLeft,
  FileText,
  Settings,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { isAdminTokenValid } from "../Auth/adminAuth";

function Notify() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!isAdminTokenValid()) {
      navigate("/admin/login");
    }
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

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleColorChange = (color) => {
    formatText("foreColor", color);
  };

  const handleBackgroundColorChange = (color) => {
    formatText("backColor", color);
  };

  const handleFontSizeChange = (size) => {
    formatText("fontSize", size);
  };

  const clearFormatting = () => {
    formatText("removeFormat");
    setNotification("");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      setNotification(editorRef.current.innerHTML);
    }
  };

  const handleReleaseNotification = async () => {
    if (!notification.trim()) {
      showToast("error", "Please enter a notification message");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("admin-token");

      const res = await axios.post(
        "/admin/notifyAllUser",
        { message: notification },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast(
        "success",
        `Notification sent to ${res.data.total} users. ${
          res.data.failed ? `${res.data.failed} failed.` : ""
        }`
      );

      setNotification("");
      if (editorRef.current) editorRef.current.innerHTML = "";
    } catch (error) {
      console.error("❌ Failed to release notification:", error);
      showToast("error", "Failed to release notification");
    } finally {
      setLoading(false);
    }
  };

  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  const toolbarButtons = [
    {
      icon: Bold,
      action: () => formatText("bold"),
      title: "Bold",
      group: "format",
    },
    {
      icon: Italic,
      action: () => formatText("italic"),
      title: "Italic",
      group: "format",
    },
    {
      icon: Underline,
      action: () => formatText("underline"),
      title: "Underline",
      group: "format",
    },
    {
      icon: AlignLeft,
      action: () => formatText("justifyLeft"),
      title: "Align Left",
      group: "align",
    },
    {
      icon: AlignCenter,
      action: () => formatText("justifyCenter"),
      title: "Align Center",
      group: "align",
    },
    {
      icon: AlignRight,
      action: () => formatText("justifyRight"),
      title: "Align Right",
      group: "align",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto w-full">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors duration-300 group text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-4 flex-col sm:flex-row">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                  Send Notification
                </h1>
                <p className="text-gray-400 text-sm sm:text-lg">
                  Create and send notifications to all platform users
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-xs sm:text-sm">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-blue-400">Target Audience</p>
                    <p className="font-bold text-blue-300">All Users</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-green-400">Delivery</p>
                    <p className="font-bold text-green-300">Instant</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-purple-400">Type</p>
                    <p className="font-bold text-purple-300">Broadcast</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Toolbar */}
          <div className="bg-gray-700/50 border-b border-gray-600 p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-center sm:justify-start">
              {/* Format Group */}
              <div className="flex items-center gap-1 p-1 sm:p-2 bg-gray-600/50 rounded-2xl">
                {toolbarButtons
                  .filter((btn) => btn.group === "format")
                  .map((button, index) => {
                    const Icon = button.icon;
                    return (
                      <button
                        key={index}
                        onClick={button.action}
                        className="p-1 sm:p-2 text-gray-300 hover:text-white hover:bg-gray-500 rounded-xl transition-all duration-300 hover:scale-110"
                        title={button.title}
                        aria-label={button.title}
                      >
                        <Icon size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    );
                  })}
              </div>

              {/* Alignment Group */}
              <div className="flex items-center gap-1 p-1 sm:p-2 bg-gray-600/50 rounded-2xl">
                {toolbarButtons
                  .filter((btn) => btn.group === "align")
                  .map((button, index) => {
                    const Icon = button.icon;
                    return (
                      <button
                        key={index}
                        onClick={button.action}
                        className="p-1 sm:p-2 text-gray-300 hover:text-white hover:bg-gray-500 rounded-xl transition-all duration-300 hover:scale-110"
                        title={button.title}
                        aria-label={button.title}
                      >
                        <Icon size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    );
                  })}
              </div>

              {/* Font Size */}
              <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 bg-gray-600/50 rounded-2xl min-w-[120px] sm:min-w-[150px]">
                <Type size={16} className="text-gray-300" />
                <select
                  onChange={(e) => handleFontSizeChange(e.target.value)}
                  className="bg-gray-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-xl text-xs sm:text-sm border border-gray-500 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                  defaultValue="3"
                >
                  <option value="1">Small</option>
                  <option value="3">Normal</option>
                  <option value="5">Large</option>
                  <option value="7">X-Large</option>
                </select>
              </div>

              {/* Colors */}
              <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 bg-gray-600/50 rounded-2xl">
                <Palette size={16} className="text-gray-300" />
                <div className="flex gap-2">
                  <div className="relative group">
                    <input
                      type="color"
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl cursor-pointer border-2 border-gray-500 hover:border-cyan-400 transition-colors duration-300"
                      title="Text Color"
                      aria-label="Text Color"
                    />
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none pointer-events-none">
                      Text
                    </span>
                  </div>
                  <div className="relative group">
                    <input
                      type="color"
                      onChange={(e) => handleBackgroundColorChange(e.target.value)}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl cursor-pointer border-2 border-gray-500 hover:border-cyan-400 transition-colors duration-300"
                      title="Background Color"
                      aria-label="Background Color"
                    />
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none pointer-events-none">
                      BG
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                <button
                  onClick={clearFormatting}
                  className="p-2 sm:p-3 text-gray-300 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-110"
                  title="Clear Formatting"
                  aria-label="Clear Formatting"
                >
                  <RotateCcw size={16} />
                </button>

                <button
                  onClick={togglePreview}
                  className={`p-2 sm:p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                    isPreview
                      ? "text-blue-400 bg-blue-500/20 border border-blue-500/30"
                      : "text-gray-300 hover:text-white hover:bg-gray-500"
                  }`}
                  title="Toggle Preview"
                  aria-pressed={isPreview}
                  aria-label="Toggle Preview"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-8">
            {isPreview ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-100">
                    Preview
                  </h3>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-2xl p-4 sm:p-8 min-h-[250px] sm:min-h-[400px] max-h-[400px] overflow-auto">
                  <div className="bg-gray-600/30 border border-gray-500/30 rounded-xl p-2 sm:p-4 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1 sm:gap-2 text-gray-300 text-xs sm:text-sm">
                      <Bell className="w-4 h-4" />
                      <span>Platform Notification</span>
                    </div>
                  </div>
                  <div
                    className="text-gray-100 leading-relaxed text-sm sm:text-base break-words"
                    dangerouslySetInnerHTML={{
                      __html:
                        notification ||
                        '<p class="text-gray-400">Your notification preview will appear here...</p>',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-100">
                    Compose Notification
                  </h3>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleContentChange}
                  className="bg-gray-700 border border-gray-600 text-gray-100 p-4 sm:p-8 rounded-2xl min-h-[250px] sm:min-h-[400px] max-h-[600px] overflow-y-auto focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 leading-relaxed text-sm sm:text-base transition-all duration-300 hover:border-gray-500 break-words"
                  style={{
                    minHeight: "250px",
                    maxHeight: "600px",
                  }}
                  placeholder="Type your notification message here..."
                  suppressContentEditableWarning={true}
                />
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 sm:p-4 text-xs sm:text-sm">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Settings className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-300 font-medium mb-1">Formatting Tips</p>
                      <p className="text-blue-200">
                        Use the toolbar above to format your notification. You can
                        make text bold, italic, change colors, and more.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-700/50 border-t border-gray-600 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
              <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-1 sm:gap-2 max-w-full break-words">
                <FileText className="w-4 h-4" />
                {notification.trim()
                  ? `${notification.replace(/<[^>]*>/g, "").length} characters`
                  : "No content yet"}
              </div>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start">
                <button
                  onClick={togglePreview}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-100 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 border border-gray-500 hover:border-gray-400 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Eye size={16} />
                  {isPreview ? "Edit" : "Preview"}
                </button>
                <button
                  onClick={handleReleaseNotification}
                  disabled={loading || !notification.trim()}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap ${
                    loading || !notification.trim()
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white hover:shadow-xl hover:shadow-cyan-500/25"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Releasing...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Release Notification</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Guidelines Section */}
        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md max-w-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-100">Best Practices</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="space-y-2 sm:space-y-3">
              <h4 className="font-medium text-green-300 flex items-center gap-1 sm:gap-2">
                <CheckCircle className="w-4 h-4" />
                Do's
              </h4>
              <ul className="text-gray-300 space-y-1 sm:space-y-2 pl-5 list-disc">
                <li>Keep messages clear and concise</li>
                <li>Use formatting sparingly for emphasis</li>
                <li>Preview your notification before sending</li>
                <li>Consider the timing of your notification</li>
                <li>Make sure important information stands out</li>
              </ul>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <h4 className="font-medium text-red-300 flex items-center gap-1 sm:gap-2">
                <AlertTriangle className="w-4 h-4" />
                Don'ts
              </h4>
              <ul className="text-gray-300 space-y-1 sm:space-y-2 pl-5 list-disc">
                <li>Avoid excessive formatting or colors</li>
                <li>Don't send frequent notifications</li>
                <li>Avoid using all caps</li>
                <li>Don't include sensitive information</li>
                <li>Avoid overly promotional language</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Toast Notifications */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 duration-300 max-w-xs sm:max-w-sm">
          <div
            className={`px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md break-words ${
              toast.type === "success"
                ? "bg-green-800/90 border-green-600 text-green-100"
                : toast.type === "error"
                ? "bg-red-800/90 border-red-600 text-red-100"
                : "bg-blue-800/90 border-blue-600 text-blue-100"
            }`}
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  toast.type === "success"
                    ? "bg-green-400"
                    : toast.type === "error"
                    ? "bg-red-400"
                    : "bg-blue-400"
                } animate-pulse`}
              ></div>
              <span className="font-medium text-sm">{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animation Styles */}
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

export default Notify;
