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

  const neonStyle = { filter: "drop-shadow(0 0 1.5px #099) drop-shadow(0 0 3px #099)" };

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

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
  }, [username, user, navigate]);

  useEffect(() => {
    if (chat.length > 0 && actualUserId && user?._id) {
      socket.emit("messageSeen", {
        from: actualUserId,
        to: user._id,
      });
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, actualUserId, user]);

  const handleSend = () => {
    if (!message.trim() || !actualUserId || !user?._id) return;

    const newMsg = {
      from: user._id,
      to: actualUserId,
      message: message.trim(),
    };

    socket.emit("sendMessage", newMsg);
    setChat((prev) => [...prev, { ...newMsg, createdAt: new Date(), seen: false }]);
    setMessage("");
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessageStatus = (msg) => {
    if (user && msg.from === user._id) {
      if (msg.seen) {
        return <CheckCheck className="w-3 h-3 text-[#0bb]" style={neonStyle} />;
      } else {
        return <Check className="w-3 h-3 text-gray-500" />;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#172133] p-2 md:p-4 text-[#0bb]">
      <div className="max-w-4xl mx-auto h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)] flex flex-col">
        {chatWithUserInfo && (
          <div className="mb-3 md:mb-4">
            <div className="bg-[#172133] border border-[#1f2a47] rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-subtleNeon backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                  <button
                    onClick={() => navigate("/chat")}
                    className="p-1.5 md:p-2 bg-[#1a2b46] rounded-xl hover:bg-[#273b62] transition-colors duration-300 group"
                  >
                    <ArrowLeft
                      className="w-4 h-4 md:w-5 md:h-5 text-[#4488bb] group-hover:text-[#0bb]"
                      style={neonStyle}
                    />
                  </button>
                  <Link
                    to={`/user/${chatWithUserInfo.username}`}
                    className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity duration-300"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-[#1f2a47] hover:border-[#0bb] transition-colors duration-300">
                        <img
                          src={
                            chatWithUserInfo.profileImageURL || "/default-avatar.png"
                          }
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-[#172133]"></div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 md:gap-2">
                        <span className="font-semibold text-transparent bg-gradient-to-r from-[#0bb] to-[#145279] bg-clip-text text-sm md:text-lg">
                          @{chatWithUserInfo.username}
                        </span>
                        {chatWithUserInfo.isVerified && (
                          <img
                            src={verifiedIcon}
                            alt="Verified"
                            className="w-4 h-4 md:w-5 md:h-5"
                          />
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-[#5588aa]">{chatWithUserInfo.name}</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 bg-[#1a2b46] border border-[#1f2a47] rounded-2xl md:rounded-3xl shadow-subtleNeon backdrop-blur-md overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-2 md:space-y-4 custom-scrollbar">
            {chat.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 md:p-6 bg-[#172133]/70 rounded-full mb-3 md:mb-4">
                  <MessageCircle className="w-8 h-8 md:w-12 md:h-12 text-[#4488bb]" style={neonStyle} />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[#88bbdd] mb-1 md:mb-2">
                  Start the conversation
                </h3>
                <p className="text-sm md:text-base text-[#5588aa]">Send a message to get started</p>
              </div>
            ) : (
              chat.map((msg, idx) => {
                const isSender = user && msg.from === user._id;
                const isNextFromSame = chat[idx + 1] && chat[idx + 1].from === msg.from;
                const isPrevFromSame = chat[idx - 1] && chat[idx - 1].from === msg.from;

                return (
                  <div
                    key={idx}
                    className={`flex ${isSender ? "justify-end" : "justify-start"} ${isPrevFromSame ? "mt-0.5 md:mt-1" : "mt-2 md:mt-4"}`}
                  >
                    <div className={`max-w-[90%] sm:max-w-[85%] md:max-w-md ${isSender ? "ml-6 md:ml-12" : "mr-6 md:mr-12"}`}>
                      <div
                        className={`px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl break-words shadow-lg ${
                          isSender
                            ? `bg-gradient-to-r from-[#0bb] to-[#145279] text-white ${
                                isNextFromSame ? "rounded-br-md" : ""
                              } ${isPrevFromSame ? "rounded-tr-md" : ""}`
                            : `bg-[#1c2b46] text-[#88bbdd] border border-[#273b62] ${
                                isNextFromSame ? "rounded-bl-md" : ""
                              } ${isPrevFromSame ? "rounded-tl-md" : ""}`
                        } transition-all duration-300 hover:shadow-xl ${
                          isSender ? "hover:shadow-[#0bb]/25" : "hover:shadow-[#446677]/25"
                        }`}
                      >
                        <p className="text-xs sm:text-sm md:text-base leading-relaxed">{msg.message}</p>
                      </div>

                      <div
                        className={`flex items-center gap-1 mt-1 px-1 md:px-2 ${
                          isSender ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span className="text-xs text-[#5588aa]">{formatTime(msg.createdAt)}</span>
                        {getMessageStatus(msg)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef}></div>
          </div>

          <div className="p-3 md:p-6 border-t border-[#1f2a47] bg-[#172133]/50">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex-1 relative group">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  type="text"
                  className="w-full px-3 py-3 md:px-4 md:py-4 bg-[#1a2b46] border-2 border-[#1f2a47] rounded-xl md:rounded-2xl text-[#0bb] placeholder-[#0a4d74] focus:outline-none focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/30 transition-all duration-300 hover:border-[#145279] pr-10 md:pr-12 text-sm md:text-base"
                  placeholder="Type a message..."
                  maxLength={500}
                />
                <span className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 text-xs text-[#5588aa]">{message.length}/500</span>
              </div>

              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="p-3 md:p-4 bg-gradient-to-r from-[#0bb] to-[#145279] text-white rounded-xl md:rounded-2xl shadow-subtleNeonBtn transition-all duration-300 hover:from-[#099] hover:to-[#0a4d74] hover:shadow-subtleNeonBtnHover hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" style={neonStyle} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 animate-in slide-in-from-top-2 duration-300">
          <div
            className={`px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-subtleNeon border backdrop-blur-md ${
              toast.type === "success"
                ? "bg-green-900/90 border-green-700 text-green-200"
                : "bg-red-900/90 border-red-700 text-red-200"
            }`}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  toast.type === "success" ? "bg-green-500" : "bg-red-500"
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

        /* Subtle Neon Shadows */
        .shadow-subtleNeon {
          box-shadow: 0 0 2px #099, 0 0 6px #0991a;
        }
        .shadow-subtleNeonHover:hover {
          box-shadow: 0 0 3px #0bb, 0 0 9px #0bb2a;
        }
        .shadow-subtleNeonBtn {
          box-shadow: 0 0 2px #0995;
        }
        .shadow-subtleNeonBtnHover:hover {
          box-shadow: 0 0 4px #0bb, 0 0 8px #0bb3a;
        }
      `}</style>
    </div>
  );
}

export default Message;
