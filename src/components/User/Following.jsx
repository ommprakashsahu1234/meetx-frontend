import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { useParams, useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/images/user.png";
import { Link } from "react-router-dom";
import VerifiedIcon from "../../assets/images/verified.svg";
import { 
  UserCheck, 
  MessageCircle, 
  UserPlus, 
  ArrowLeft, 
  Crown,
  User,
  Users2
} from "lucide-react";

function Following() {
  const { username } = useParams();
  const [followings, setFollowings] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isUsernameVerified, setIsUsernameVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const fetchFollowings = async () => {
      try {
        setLoading(true);
        const userRes = await axios.get(`/user/username/${username}`);
        const targetUser = userRes.data.user;
        setIsUsernameVerified(targetUser.isVerified);

        const loggedInRes = await axios.get("/user/profile");
        setCurrentUserId(loggedInRes.data.user._id);

        const res = await axios.get(`/user/${username}/following`);
        setFollowings(res.data);
      } catch (err) {
        console.error("Error loading following", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowings();
  }, [username, navigate]);

  const handleFollow = async (followeeId) => {
    try {
      await axios.post(`/user/follow/${followeeId}`);
      setFollowings((prev) =>
        prev.map((f) => (f._id === followeeId ? { ...f, isMutual: true } : f))
      );
    } catch (err) {
      console.error("Follow failed", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-12 shadow-2xl backdrop-blur-md text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading following...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-3 bg-gray-700 rounded-2xl hover:bg-gray-600 transition-colors duration-300 group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-cyan-400" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 flex flex-wrap items-center gap-2">
                    Following of{" "}
                    <Link
                      to={`/user/${username}`}
                      className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text hover:from-cyan-300 hover:to-blue-300 transition-all duration-300"
                    >
                      @{username}
                    </Link>
                    {isUsernameVerified && (
                      <img src={VerifiedIcon} alt="Verified" className="w-6 h-6" />
                    )}
                  </h1>
                  <p className="text-gray-400">
                    Following {followings.length} {followings.length === 1 ? 'user' : 'users'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {followings.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-12 shadow-2xl backdrop-blur-md text-center">
            <div className="p-6 bg-gray-700/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Users2 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">Not following anyone yet</h3>
            <p className="text-gray-400 text-lg">
              @{username} hasn't followed anyone at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {followings.map((f, index) => (
              <div
                key={f._id}
                className="group bg-gray-800 border border-gray-700 rounded-2xl p-4 shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 hover:scale-[1.02] hover:border-gray-600"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards'
                }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <Link
                    to={`/user/${f.username}`}
                    className="flex items-center gap-4 flex-1 min-w-0 group-hover:scale-[1.02] transition-transform duration-300"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-cyan-400 transition-colors duration-300">
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

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-100 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300 truncate">
                          @{f.username}
                        </span>
                        {f.isVerified && (
                          <img
                            src={VerifiedIcon}
                            alt="Verified"
                            className="w-4 h-4 flex-shrink-0"
                          />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">{f.name}</p>
                    </div>
                  </Link>

                  {f._id !== currentUserId && (
                    <div className="flex gap-2 flex-shrink-0">
                      {f.isMutual ? (
                        <button
                          onClick={() => navigate(`/chat/${f.username}`)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Message</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFollow(f._id)}
                          className="px-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 font-medium rounded-xl transition-all duration-300 hover:bg-gray-600 hover:border-cyan-500 hover:text-cyan-400 hover:scale-105 active:scale-95 flex items-center gap-2 group"
                        >
                          <UserPlus className="w-4 h-4 text-gray-400 group-hover:text-cyan-400" />
                          <span className="hidden sm:inline">Follow</span>
                        </button>
                      )}
                    </div>
                  )}

                  {f._id === currentUserId && (
                    <div className="px-3 py-1 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-xl text-yellow-300 text-sm font-medium flex items-center gap-2">
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
          from {
            opacity: 0;
            transform: translateY(20px);
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

export default Following;
