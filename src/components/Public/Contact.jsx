import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import axios from "../utils/axios";
import {
  MessageSquare,
  Send,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Mail,
  FileText,
  Clock,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";

function Contact() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [issueType, setIssueType] = useState("Media Posting Issue");
  const [description, setDescription] = useState("");
  const [complaintId, setComplaintId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const copyComplaintId = () => {
    if (!complaintId) return;
    navigator.clipboard
      .writeText(complaintId)
      .then(() => {
        setCopySuccess("Copied!");
        setTimeout(() => setCopySuccess(null), 2000); // Clear message after 2s
      })
      .catch(() => {
        setCopySuccess("Failed to copy");
        setTimeout(() => setCopySuccess(null), 2000);
      });
  };
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast("error", "Please describe the Issue");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/user/contact", {
        issueType,
        description,
      });

      setComplaintId(res.data.complaintId);
      showToast("success", "Complaint submitted successfully");
      setDescription("");
    } catch (err) {
      showToast("error", "Something went wrong. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const issueTypes = [
    "Media Posting Issue",
    "Commenting Issue",
    "Reporting Issue",
    "Liking Issue",
    "Following Issue",
    "Notification Issue",
    "Chat Message Issue",
    "Verification Issue",
    "Blocked User Issue",
    "Others",
  ];

  const getIssueIcon = (type) => {
    const iconMap = {
      "Media Posting Issue": "📸",
      "Commenting Issue": "💬",
      "Reporting Issue": "🚩",
      "Liking Issue": "❤️",
      "Following Issue": "👥",
      "Notification Issue": "🔔",
      "Chat Message Issue": "💌",
      "Verification Issue": "✅",
      "Blocked User Issue": "🚫",
      Others: "❓",
    };
    return iconMap[type] || "❓";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4 text-sm sm:text-base">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
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
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent leading-tight">
                  Contact Support
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  We're here to help you resolve any issues
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Issue Type */}
                <div className="relative group">
                  <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3 select-none">
                    Select Issue Type
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl select-none pointer-events-none">
                      {getIssueIcon(issueType)}
                    </div>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full pl-16 pr-12 py-3 sm:py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 appearance-none cursor-pointer text-sm sm:text-base"
                      aria-label="Select issue type"
                    >
                      {issueTypes.map((type, idx) => (
                        <option key={idx} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                  </div>
                </div>

                {/* Description */}
                <div className="relative group">
                  <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3 select-none">
                    Describe the Issue
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400 pointer-events-none" />
                    <textarea
                      rows={6}
                      placeholder="Please explain what exactly is happening. The more details you provide, the better we can help you..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={1000}
                      className="w-full pl-12 pr-4 py-3 sm:py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 resize-none text-sm sm:text-base"
                      aria-label="Issue description"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs sm:text-sm text-gray-500 select-none">
                    <span>Be as detailed as possible</span>
                    <span>{description.length}/1000</span>
                  </div>
                </div>

                {complaintId && (
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-3xl p-4 sm:p-6 max-w-full">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                      <h3 className="text-lg sm:text-xl font-semibold text-green-300">
                        Complaint Submitted Successfully!
                      </h3>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-4 text-sm sm:text-base whitespace-nowrap max-w-full overflow-x-auto select-text">
                      <p className="text-gray-300 mb-2">Your Complaint ID:</p>
                      <code className="text-2xl sm:text-3xl font-bold text-white bg-gray-800 px-4 py-2 rounded-xl border border-gray-600 select-all whitespace-nowrap block max-w-full overflow-x-auto">
                        {complaintId}
                      </code>
                    </div>
                    <button
                      onClick={copyComplaintId}
                      className="mt-3 w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-semibold transition-colors duration-300 select-none whitespace-nowrap flex justify-center sm:inline-flex"
                      aria-label="Copy complaint ID"
                      type="button"
                    >
                      Copy
                    </button>
                    {copySuccess && (
                      <span className="block mt-2 text-green-400 text-sm select-none text-center sm:text-left">
                        {copySuccess}
                      </span>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !description.trim()}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-sm sm:text-base select-none"
                  aria-disabled={loading || !description.trim()}
                  aria-label="Submit complaint"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Complaint</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Important Note */}
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md text-sm sm:text-base">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                <h3 className="font-semibold text-gray-100">Important Note</h3>
              </div>

              <div className="space-y-4 text-gray-300">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-300 mb-1">
                        Have Screenshots?
                      </p>
                      <p>
                        Email your visual proof to{" "}
                        <a
                          href="mailto:ommprakashsahu.work@gmail.com"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 underline break-all"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          ommprakashsahu.work@gmail.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-300 mb-1">
                        Time Limit
                      </p>
                      <p>
                        Send your email within{" "}
                        <span className="font-bold text-red-300">
                          15 minutes
                        </span>{" "}
                        of submitting this form.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-300 mb-1">
                        Email Subject
                      </p>
                      <p>
                        Use your{" "}
                        <span className="font-bold text-blue-300">
                          Complaint ID
                        </span>{" "}
                        as the email subject line.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md text-sm sm:text-base">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-cyan-400" />
                <h3 className="font-semibold text-gray-100">Quick Tips</h3>
              </div>

              <ul className="space-y-3 text-gray-300 list-inside list-disc">
                <li>Be specific about when the issue occurs</li>
                <li>Include error messages if any</li>
                <li>Mention your device and browser</li>
                <li>Attach screenshots if possible</li>
              </ul>
            </div>

            {/* Response Time */}
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md text-sm sm:text-base">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-green-400" />
                <h3 className="font-semibold text-gray-100">Response Time</h3>
              </div>

              <div className="text-gray-300 space-y-2">
                <div className="flex justify-between">
                  <span>Critical Issues:</span>
                  <span className="text-red-400 font-medium">2-4 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>General Issues:</span>
                  <span className="text-yellow-400 font-medium">
                    24-48 hours
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Feature Requests:</span>
                  <span className="text-green-400 font-medium">3-5 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 duration-300 max-w-xs sm:max-w-sm">
          <div
            className={`px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md break-words ${
              toast.type === "success"
                ? "bg-green-800/90 border-green-600 text-green-100"
                : "bg-red-800/90 border-red-600 text-red-100"
            }`}
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  toast.type === "success" ? "bg-green-400" : "bg-red-400"
                } animate-pulse`}
              ></div>
              <span className="font-medium text-sm">{toast.message}</span>
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

export default Contact;
