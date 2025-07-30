import React, { useEffect, useState, useRef } from "react";
import socket from "../../socket/socket";
import axios from "../utils/axios";
import { useAuth } from "../Auth/AuthContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import verifiedIcon from "../../assets/images/verified.svg";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  User,
  Check,
  CheckCheck,
  Clock,
} from "lucide-react";

function Message() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { chatWithUserId: username } = useParams();

  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [actualUserId, setActualUserId] = useState(null);
  const [chatWithUserInfo, setChatWithUserInfo] = useState(null);
  const [toast, setToast] = useState(null);
  const bottomRef = useRef();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

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
    if (!user) return;
    socket.emit("join", user._id);

    socket.on("receiveMessage", (msg) => {
      if (msg.from === actualUserId || msg.to === actualUserId) {
        setChat((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [user, actualUserId]);

  useEffect(() => {
    const fetchChat = async () => {
      if (username === user?.username) {
        showToast("error", "Cannot Message Yourself!");
        navigate("/chat");
        return;
      }

      try {
        const res = await axios.get(`/messages/by-username/${username}`);
        setChat(res.data.messages);
        setActualUserId(res.data.userId);
        setChatWithUserInfo(res.data.chatWithUser);
      } catch (err) {
        if (err.response?.status === 404) {
          showToast("error", "User not found!");
          navigate("/chat");
        } else {
          console.error("Failed to fetch messages", err);
          showToast("error", "Something Went Wrong! CODE - ERRFND");
        }
      }
    };

    if (username && user) fetchChat();
  }, [username, user]);

  useEffect(() => {
    if (chat.length > 0 && actualUserId && user?._id) {
      socket.emit("messageSeen", {
        from: actualUserId,
        to: user._id,
      });
    }

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, actualUserId]);

  const handleSend = () => {
    if (!message.trim() || !actualUserId || !user?._id) return;

    const newMsg = {
      from: user._id,
      to: actualUserId,
      message: message.trim(),
    };

    socket.emit("sendMessage", newMsg);
    setChat((prev) => [
      ...prev,
      { ...newMsg, createdAt: new Date(), seen: false },
    ]);
    setMessage("");
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessageStatus = (msg) => {
    if (user && msg.from === user._id) {
      if (msg.seen) {
        return <CheckCheck className="w-3 h-3 text-blue-400" />;
      } else {
        return <Check className="w-3 h-3 text-gray-400" />;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-2 md:p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)] flex flex-col">
        {chatWithUserInfo && (
          <div className="mb-3 md:mb-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                  <button
                    onClick={() => navigate("/chat")}
                    className="p-1.5 md:p-2 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors duration-300 group"
                  >
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-cyan-400" />
                  </button>
                  <Link
                    to={`/user/${chatWithUserInfo.username}`}
                    className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity duration-300"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-gray-600 hover:border-cyan-400 transition-colors duration-300">
                        <img
                          src={
                            chatWithUserInfo.profileImageURL ||
                            "/default-avatar.png"
                          }
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 md:gap-2">
                        <span className="font-semibold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-sm md:text-lg">
                          @{chatWithUserInfo.username}
                        </span>
                        {chatWithUserInfo.isVerified && (
                          <img
                            src={verifiedIcon}
                            alt="Verified"
                            className="w-4 h-4 md:w-5 md:h-5"
                            draggable={false}
                          />
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-gray-400">
                        {chatWithUserInfo.name}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 bg-gray-800 border border-gray-700 rounded-2xl md:rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-2 md:space-y-4 custom-scrollbar">
              {chat.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="p-4 md:p-6 bg-gray-700/50 rounded-full mb-3 md:mb-4">
                    <MessageCircle className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-300 mb-1 md:mb-2">
                    Start the conversation
                  </h3>
                  <p className="text-sm md:text-base text-gray-400">Send a message to get started</p>
                </div>
              ) : (
                chat.map((msg, idx) => {
                  const isSender = user && msg.from === user._id;
                  const isNextFromSame =
                    chat[idx + 1] && chat[idx + 1].from === msg.from;
                  const isPrevFromSame =
                    chat[idx - 1] && chat[idx - 1].from === msg.from;

                  return (
                    <div
                      key={idx}
                      className={`flex ${
                        isSender ? "justify-end" : "justify-start"
                      } ${isPrevFromSame ? "mt-0.5 md:mt-1" : "mt-2 md:mt-4"}`}
                    >
                      <div
                        className={`max-w-[90%] sm:max-w-[85%] md:max-w-md ${
                          isSender ? "ml-6 md:ml-12" : "mr-6 md:mr-12"
                        }`}
                      >
                        <div
                          className={`px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl break-words shadow-lg ${
                            isSender
                              ? `bg-gradient-to-r from-cyan-500 to-blue-600 text-white ${
                                  isNextFromSame ? "rounded-br-md" : ""
                                } ${isPrevFromSame ? "rounded-tr-md" : ""}`
                              : `bg-gray-700 text-gray-100 border border-gray-600 ${
                                  isNextFromSame ? "rounded-bl-md" : ""
                                } ${isPrevFromSame ? "rounded-tl-md" : ""}`
                          } transition-all duration-300 hover:shadow-xl ${
                            isSender
                              ? "hover:shadow-cyan-500/25"
                              : "hover:shadow-gray-500/25"
                          }`}
                        >
                          <p className="text-xs sm:text-sm md:text-base leading-relaxed">
                            {msg.message}
                          </p>
                        </div>

                        <div
                          className={`flex items-center gap-1 mt-1 px-1 md:px-2 ${
                            isSender ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="text-xs text-gray-500">
                            {formatTime(msg.createdAt)}
                          </span>
                          {getMessageStatus(msg)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef}></div>
            </div>

            <div className="p-3 md:p-6 border-t border-gray-700 bg-gray-750/50">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex-1 relative group">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    type="text"
                    className="w-full px-3 py-3 md:px-4 md:py-4 bg-gray-700 border-2 border-gray-600 rounded-xl md:rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500 pr-10 md:pr-12 text-sm md:text-base"
                    placeholder="Type a message..."
                    maxLength={500}
                  />
                  <span className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                    {message.length}/500
                  </span>
                </div>

                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="p-3 md:p-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl md:rounded-2xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
                >
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 animate-in slide-in-from-top-2 duration-300">
          <div
            className={`px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-2xl border backdrop-blur-md ${
              toast.type === "success"
                ? "bg-green-800/90 border-green-600 text-green-100"
                : "bg-red-800/90 border-red-600 text-red-100"
            }`}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  toast.type === "success" ? "bg-green-400" : "bg-red-400"
                } animate-pulse`}
              ></div>
              <span className="font-medium text-sm md:text-base">{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        @media (min-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </div>
  );
}

export default Message;
