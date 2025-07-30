import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { formatNotificationTime } from "../utils/formatTime";
import { useNavigate } from "react-router-dom";
import AdminImg from "../../assets/images/admin.png";
import verifiedIcon from "../../assets/images/verified.svg";
import { Bell, Heart, MessageCircle, UserPlus, Shield } from "lucide-react";

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/user/notifications");
        const notis = res.data.notifications;

        notis.forEach((n) => {
          console.log(
            `Notification from @${n.fromUserId?.username} → isVerified:`,
            n.fromUserId?.isVerified
          );
        });
        setNotifications(res.data.notifications);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    fetchNotifications();

    const markRead = async () => {
      try {
        await axios.put("/user/mark-read");
      } catch (err) {
        console.error("Failed to mark notifications as read", err);
      }
    };

    markRead();
  }, []);

  const handleClick = (n) => {
    if (n.postId) {
      navigate(`#`);
    }
  };

  const newNotis = notifications.filter((n) => !n.isGot);
  const oldNotis = notifications.filter((n) => n.isGot);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "follow":
        return <UserPlus className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />;
      case "like":
        return <Heart className="w-3 h-3 md:w-4 md:h-4 text-red-400" />;
      case "comment":
        return <MessageCircle className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />;
      case "admin":
      case "action":
        return <Shield className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />;
      default:
        return <Bell className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />;
    }
  };

  const renderNotification = (n) => (
    <li
      key={n._id}
      onClick={() => handleClick(n)}
      className={`group relative overflow-hidden rounded-xl md:rounded-2xl border transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl ${
        !n.isGot 
          ? "bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-500/30 shadow-lg shadow-cyan-500/10" 
          : "bg-gray-800 border-gray-700 hover:border-gray-600"
      }`}
    >
      {!n.isGot && (
        <div className="absolute top-2 right-2 md:top-3 md:right-3 w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
      )}

      <div className="p-3 md:p-4">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-cyan-400 transition-colors duration-300">
              {["follow", "like", "comment"].includes(n.type) ? (
                <img
                  src={n.fromUserId.profileImageURL}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <img
                  src={AdminImg}
                  alt="Admin"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 p-0.5 md:p-1 bg-gray-800 rounded-full border-2 border-gray-700">
              {getNotificationIcon(n.type)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {n.type === "follow" && (
              <div>
                <p className="text-gray-100 text-xs sm:text-sm md:text-base leading-relaxed">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/user/${n.fromUserId.username}`);
                    }}
                    className="font-semibold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text hover:from-cyan-300 hover:to-blue-300 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
                  >
                    @{n.fromUserId.username}
                    {n.fromUserId.isVerified && (
                      <img
                        src={verifiedIcon}
                        alt="Verified"
                        className="w-3 h-3 md:w-4 md:h-4"
                        draggable={false}
                      />
                    )}
                  </span>{" "}
                  <span className="text-gray-300">started following you</span>
                </p>
              </div>
            )}

            {n.type === "like" && (
              <div>
                <p className="text-gray-100 text-xs sm:text-sm md:text-base leading-relaxed">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/user/${n.fromUserId.username}`);
                    }}
                    className="font-semibold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text hover:from-cyan-300 hover:to-blue-300 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
                  >
                    @{n.fromUserId.username}
                    {n.fromUserId.isVerified && (
                      <img
                        src={verifiedIcon}
                        alt="Verified"
                        className="w-3 h-3 md:w-4 md:h-4"
                        draggable={false}
                      />
                    )}
                  </span>{" "}
                  <span className="text-gray-300">liked your post</span>
                </p>
              </div>
            )}

            {n.type === "comment" && (
              <div>
                <p className="text-gray-100 text-xs sm:text-sm md:text-base leading-relaxed">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/user/${n.fromUserId.username}`);
                    }}
                    className="font-semibold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text hover:from-cyan-300 hover:to-blue-300 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
                  >
                    @{n.fromUserId.username}
                    {n.fromUserId.isVerified && (
                      <img
                        src={verifiedIcon}
                        alt="Verified"
                        className="w-3 h-3 md:w-4 md:h-4"
                        draggable={false}
                      />
                    )}
                  </span>{" "}
                  <span className="text-gray-300">commented on your post</span>
                </p>
                {n.message && (
                  <div className="mt-2 p-2 md:p-3 bg-gray-700/50 rounded-lg md:rounded-xl border border-gray-600">
                    <p className="text-gray-200 text-xs md:text-sm italic leading-relaxed">"{n.message}"</p>
                  </div>
                )}
              </div>
            )}

            {["action", "admin"].includes(n.type) && n.message && (
              <div>
                <p className="text-gray-100 text-xs sm:text-sm md:text-base font-medium leading-relaxed">{n.message}</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-2 md:mt-3">
              <span className="inline-flex items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-1 bg-gray-700/50 rounded-full text-xs text-gray-400 border border-gray-600">
                <Bell className="w-2.5 h-2.5 md:w-3 md:h-3" />
                <span className="text-xs">{formatNotificationTime(n.createdAt)}</span>
              </span>

              {n.postId && n.postId.media?.length > 0 && (
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden border-2 border-gray-600 group-hover:border-cyan-400 transition-colors duration-300 flex-shrink-0">
                  <img
                    src={n.postId.media[0].url}
                    alt="Post"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-3 md:p-4">
      <div className="max-w-3xl mx-auto">
        {/* Enhanced Mobile Header */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl md:rounded-2xl">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-400">Stay updated with your activity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile New Notifications */}
        {newNotis.length > 0 && (
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 px-1 md:px-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
              <h2 className="text-base md:text-lg font-semibold text-cyan-400">New Notifications</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
            </div>
            <ul className="space-y-3 md:space-y-4">
              {newNotis.map(renderNotification)}
            </ul>
          </div>
        )}

        {/* Enhanced Mobile Earlier Notifications */}
        {oldNotis.length > 0 && (
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 px-1 md:px-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-500 rounded-full"></div>
              <h2 className="text-base md:text-lg font-semibold text-gray-400">Earlier</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-500/50 to-transparent"></div>
            </div>
            <ul className="space-y-3 md:space-y-4">
              {oldNotis.map(renderNotification)}
            </ul>
          </div>
        )}

        {/* Enhanced Mobile Empty State */}
        {notifications.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md text-center">
            <div className="p-4 md:p-6 bg-gray-700/50 rounded-full w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 flex items-center justify-center">
              <Bell className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-300 mb-2">No notifications yet</h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-400">
              When you get notifications, they'll show up here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notification;
