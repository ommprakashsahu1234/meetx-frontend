import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import defaultAvatar from "../../assets/images/user.png";
import VerifiedIcon from "../../assets/images/verified.svg";
import {
  Users,
  MessageCircle,
  UserPlus,
  ArrowLeft,
  Crown,
  User,
  Heart
} from "lucide-react";

function Followers() {
  const { username } = useParams();
  const [followers, setFollowers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isUsernameVerified, setIsUsernameVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const neonStyle = { filter: "drop-shadow(0 0 1.5px #099) drop-shadow(0 0 3px #099)" };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const fetchFollowers = async () => {
      try {
        setLoading(true);
        const loggedInRes = await axios.get("/user/profile");
        setCurrentUserId(loggedInRes.data.user._id);

        const res = await axios.get(`/user/${username}/followers`);
        setFollowers(res.data);

        const userRes = await axios.get(`/user/username/${username}`);
        setIsUsernameVerified(userRes.data.user.isVerified);
      } catch (err) {
        console.error("Error loading followers", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [username, navigate]);

  const handleFollow = async (followerId) => {
    try {
      await axios.post(`/user/follow/${followerId}`);
      setFollowers((prev) =>
        prev.map((f) => (f._id === followerId ? { ...f, isMutual: true } : f))
      );
    } catch (err) {
      console.error("Follow failed", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#172133] p-4 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-8 sm:p-12 shadow-subtleNeon text-center backdrop-blur-md">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#0bb] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#88bbdd] text-base sm:text-lg">Loading followers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#172133] p-4 text-[#0bb]">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-4 sm:p-6 shadow-subtleNeon backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 sm:p-3 bg-[#1a2b46] rounded-2xl hover:bg-[#273b62] transition-colors duration-300"
              >
                <ArrowLeft className="w-5 h-5 text-[#4488bb]" style={neonStyle} />
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-[#0bb] to-[#145279] rounded-2xl shadow-subtleNeonBtn">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" style={neonStyle} />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-bold flex flex-wrap items-center gap-2">
                    Followers of{" "}
                    <Link
                      to={`/user/${username}`}
                      className="text-transparent bg-gradient-to-r from-[#0bb] to-[#145279] bg-clip-text hover:from-[#0dd] hover:to-[#0a4d74] transition-all duration-300"
                    >
                      @{username}
                    </Link>
                    {isUsernameVerified && (
                      <img src={VerifiedIcon} alt="Verified" className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-[#5588aa]">
                    {followers.length} {followers.length === 1 ? "follower" : "followers"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOLLOWERS LIST */}
        {followers.length === 0 ? (
          <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-6 sm:p-12 shadow-subtleNeon text-center backdrop-blur-md">
            <div className="p-4 sm:p-6 bg-[#1a2b46] rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-[#4488bb]" style={neonStyle} />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-[#88bbdd] mb-2">No followers yet</h3>
            <p className="text-xs sm:text-lg text-[#5588aa]">
              @{username} doesn't have any followers at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {followers.map((f, index) => (
              <div
                key={f._id}
                className="group bg-[#172133] border border-[#1f2a47] rounded-2xl p-4 shadow-subtleNeon hover:shadow-subtleNeonHover transition-all duration-300 hover:scale-[1.02] hover:border-[#0bb]/40"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: "fadeInUp 0.5s ease-out forwards"
                }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                  {/* User Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#1f2a47] group-hover:border-[#0bb] transition-colors duration-300">
                        <img
                          src={f.profileImageURL || defaultAvatar}
                          className="w-full h-full object-cover"
                          alt={f.username}
                        />
                      </div>
                      {f._id === currentUserId && (
                        <div className="absolute -top-1 -right-1 p-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          to={`/user/${f.username}`}
                          className="font-semibold text-sm sm:text-base text-[#0bb] truncate max-w-[150px] sm:max-w-[200px] group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#0bb] group-hover:to-[#145279] group-hover:bg-clip-text transition-all duration-300"
                        >
                          @{f.username}
                        </Link>
                        {f.isVerified && (
                          <img
                            src={VerifiedIcon}
                            alt="Verified"
                            className="w-4 h-4 flex-shrink-0"
                          />
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#88bbdd] truncate max-w-[150px] sm:max-w-[200px]">{f.name}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {f._id !== currentUserId ? (
                    <div className="flex gap-2 flex-wrap">
                      {f.isMutual ? (
                        <button
                          onClick={() => navigate(`/chat/${f.username}`)}
                          className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-[#0bb] to-[#145279] text-white font-medium rounded-xl shadow-subtleNeonBtn transition-all duration-300 hover:from-[#099] hover:to-[#0a4d74] hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Message</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFollow(f._id)}
                          className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-[#1a2b46] border border-[#1f2a47] text-[#0bb] font-medium rounded-xl transition-all duration-300 hover:bg-[#273b62] hover:border-[#0bb] hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          <UserPlus className="w-4 h-4 text-[#4488bb]" style={neonStyle} />
                          <span className="hidden sm:inline">Follow</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-xl text-yellow-300 text-xs sm:text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>You</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .shadow-subtleNeon {
          box-shadow: 0 0 2px #099, 0 0 6px #0991a;
        }
        .shadow-subtleNeonHover {
          box-shadow: 0 0 3px #0bb, 0 0 9px #0bb2a;
        }
        .shadow-subtleNeonBtn {
          box-shadow: 0 0 2px #0bb4a;
        }
      `}</style>
    </div>
  );
}

export default Followers;
