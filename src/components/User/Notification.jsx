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

  const neonStyle = { filter: "drop-shadow(0 0 1.5px #099) drop-shadow(0 0 3px #099)" };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/user/notifications");
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
    // TODO: Implement post navigation if needed
    if (n.postId) {
      navigate(`#`);
    }
  };

  const newNotis = notifications.filter((n) => !n.isGot);
  const oldNotis = notifications.filter((n) => n.isGot);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "follow":
        return <UserPlus className="w-3 h-3 md:w-4 md:h-4 text-[#0bb]" style={neonStyle} />;
      case "comment":
        return <MessageCircle className="w-3 h-3 md:w-4 md:h-4 text-[#0bb]" style={neonStyle} />;
      case "admin":
      case "action":
        return <Shield className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" style={neonStyle} />;
      default:
        return <Bell className="w-3 h-3 md:w-4 md:h-4 text-[#5588aa]" style={neonStyle} />;
    }
  };

  const renderNotification = (n) => (
    <li
      key={n._id}
      onClick={() => handleClick(n)}
      className={`group relative overflow-hidden rounded-xl md:rounded-2xl border transition-all duration-300 cursor-pointer hover:scale-[1.02] shadow-subtleNeonHover ${
        !n.isGot
          ? "bg-gradient-to-r from-[#0bb]/10 to-[#145279]/10 border-[#0bb]/40"
          : "bg-[#1a2b46] border-[#1f2a47]"
      }`}
    >
      {!n.isGot && (
        <div className="absolute top-2 right-2 md:top-3 md:right-3 w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-[#0bb] to-[#145279] rounded-full animate-pulse shadow-lg shadow-[#0bb]/40"></div>
      )}
      <div className="p-3 md:p-4">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-[#1f2a47] group-hover:border-[#0bb] transition-colors duration-300">
              {["follow", "comment"].includes(n.type) ? (
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
            <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 p-0.5 md:p-1 bg-[#172133] rounded-full border-2 border-[#1f2a47]">
              {getNotificationIcon(n.type)}
            </div>
          </div>
          <div className="flex-1 min-w-0 text-left">
            {/* FOLLOW */}
            {n.type === "follow" && (
              <div>
                <p className="text-[#88bbdd] text-xs sm:text-sm md:text-base leading-relaxed">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/user/${n.fromUserId.username}`);
                    }}
                    className="font-semibold text-transparent bg-gradient-to-r from-[#0bb] to-[#145279] bg-clip-text cursor-pointer inline-flex items-center gap-1 hover:from-[#0dd] hover:to-[#0a4d74] transition-all"
                  >
                    @{n.fromUserId.username}
                    {n.fromUserId.isVerified && (
                      <img src={verifiedIcon} alt="Verified" className="w-3 h-3 md:w-4 md:h-4" draggable={false} />
                    )}
                  </span>
                  <span className="text-[#5588aa]"> started following you</span>
                </p>
              </div>
            )}

            {/* COMMENT */}
            {n.type === "comment" && (
              <div>
                <p className="text-[#88bbdd] text-xs sm:text-sm md:text-base leading-relaxed">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/user/${n.fromUserId.username}`);
                    }}
                    className="font-semibold text-transparent bg-gradient-to-r from-[#0bb] to-[#145279] bg-clip-text cursor-pointer inline-flex items-center gap-1 hover:from-[#0dd] hover:to-[#0a4d74] transition-all"
                  >
                    @{n.fromUserId.username}
                    {n.fromUserId.isVerified && (
                      <img src={verifiedIcon} alt="Verified" className="w-3 h-3 md:w-4 md:h-4" draggable={false} />
                    )}
                  </span>
                  <span className="text-[#5588aa]"> commented on your post</span>
                </p>
                {n.message && (
                  <div className="mt-2 p-2 md:p-3 bg-[#273b62]/30 rounded-lg md:rounded-xl border border-[#1f2a47]">
                    <p className="text-[#0bb] text-xs md:text-sm italic leading-relaxed">
                      "{n.message}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ADMIN/ACTION */}
            {["action", "admin"].includes(n.type) && n.message && (
              <div>
                <p className="text-[#88bbdd] text-xs sm:text-sm md:text-base font-medium leading-relaxed">{n.message}</p>
              </div>
            )}

            {/* Footer row: Time and preview */}
            <div className="flex items-center justify-between mt-2 md:mt-3">
              <span className="inline-flex items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-1 bg-[#1a2b46]/70 rounded-full text-xs text-[#5588aa] border border-[#1f2a47]">
                <Bell className="w-2.5 h-2.5 md:w-3 md:h-3" style={neonStyle} />
                <span className="text-xs">{formatNotificationTime(n.createdAt)}</span>
              </span>
              {n.postId && n.postId.media?.length > 0 && (
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden border-2 border-[#1f2a47] group-hover:border-[#0bb] transition-colors flex-shrink-0">
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
    <div className="min-h-screen bg-[#172133] p-3 md:p-4">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 md:mb-8">
          <div className="bg-[#172133] border border-[#1f2a47] rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-subtleNeon">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-r from-[#0bb] to-[#145279] rounded-xl md:rounded-2xl shadow-subtleNeonBtn">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-white" style={neonStyle} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#0bb] to-[#145279] bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-[#5588aa]">Stay updated with your activity</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Notis */}
        {newNotis.length > 0 && (
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 px-1 md:px-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-r from-[#0bb] to-[#145279] rounded-full animate-pulse"></div>
              <h2 className="text-base md:text-lg font-semibold text-[#0bb]">New Notifications</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#0bb]/50 to-transparent"></div>
            </div>
            <ul className="space-y-3 md:space-y-4">{newNotis.map(renderNotification)}</ul>
          </div>
        )}

        {/* Old Notis */}
        {oldNotis.length > 0 && (
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 px-1 md:px-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#2e3552] rounded-full"></div>
              <h2 className="text-base md:text-lg font-semibold text-[#5588aa]">Earlier</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#5588aa]/50 to-transparent"></div>
            </div>
            <ul className="space-y-3 md:space-y-4">{oldNotis.map(renderNotification)}</ul>
          </div>
        )}

        {/* Empty state */}
        {notifications.length === 0 && (
          <div className="bg-[#1a2b46] border border-[#1f2a47] rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-subtleNeon text-center">
            <div className="p-4 md:p-6 bg-[#172133]/70 rounded-full w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 flex items-center justify-center">
              <Bell className="w-8 h-8 md:w-12 md:h-12 text-[#4488bb]" style={neonStyle} />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#88bbdd] mb-2">
              No notifications yet
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-[#5588aa]">
              When you get notifications, they'll show up here
            </p>
          </div>
        )}
      </div>
      <style>{`
        .shadow-subtleNeon { box-shadow: 0 0 2px #099, 0 0 6px #0992; }
        .shadow-subtleNeonBtn { box-shadow: 0 0 2px #0bb4a; }
        .shadow-subtleNeonHover:hover { box-shadow: 0 0 3px #0bb, 0 0 9px #0bb2a; }
      `}</style>
    </div>
  );
}

export default Notification;
