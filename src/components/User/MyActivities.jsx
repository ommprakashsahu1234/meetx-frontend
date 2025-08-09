import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { formatNotificationTime } from "../utils/formatTime";
import {
  Activity,
  Clock,
  Search,
  Filter,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function MyActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setCheckingAuth(false);
    else navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/activities");
        setActivities(res.data.activities);
      } catch (err) {
        console.error("Error loading activities", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (checkingAuth) return null;

  const filteredAndSortedActivities = activities
    .filter((act) =>
      act.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.time) - new Date(a.time);
      } else {
        return new Date(a.time) - new Date(b.time);
      }
    });

  const refreshActivities = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/activities");
      setActivities(res.data.activities);
    } catch (err) {
      console.error("Error loading activities", err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes("login") || desc.includes("signin")) return "🔐";
    if (desc.includes("post") || desc.includes("share")) return "📝";
    if (desc.includes("comment")) return "💬";
    if (desc.includes("follow")) return "👥";
    if (desc.includes("profile") || desc.includes("update")) return "👤";
    if (desc.includes("photo") || desc.includes("image")) return "📷";
    if (desc.includes("video")) return "🎥";
    if (desc.includes("message")) return "💌";
    return "⚡";
  };

  const getActivityType = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes("login") || desc.includes("signin")) return "security";
    if (desc.includes("post") || desc.includes("share")) return "content";
    if (desc.includes("comment")) return "interaction";
    if (desc.includes("follow")) return "social";
    if (desc.includes("profile")) return "account";
    return "general";
  };

  const getTypeColor = (type) => {
    const colors = {
      security: "bg-red-600/20 text-red-400 border-red-500",
      content: "bg-[#0bb]/20 text-[#0bb] border-[#0bb]/50",
      interaction: "bg-green-500/20 text-green-400 border-green-500/50",
      social: "bg-purple-500/20 text-purple-400 border-purple-500/50",
      account: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      general: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return colors[type] || colors.general;
  };

  return (
    <div className="min-h-screen bg-[#172133] text-[#0bb]">
      {/* HEADER */}
      <div className="bg-[#1a2b46] border-b border-[#0bb]/40 py-8 sm:py-10 px-4 shadow-subtleNeon">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity size={28} className="text-[#0bb]" />
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold">
                My Activities
              </h1>
            </div>
            <p className="text-sm sm:text-lg text-[#5599bb]">
              Track your recent actions and interactions on the platform
            </p>
          </div>
          <button
            onClick={refreshActivities}
            disabled={loading}
            className="bg-[#0bb]/20 hover:bg-[#0bb]/30 rounded-xl border border-[#0bb]/40 p-2 sm:p-3 shadow-neonBtn transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="bg-[#1a2b46] border border-[#0bb]/40 rounded-3xl p-4 sm:p-6 mb-8 shadow-subtleNeon">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5599bb]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base bg-[#172133] border border-[#0bb]/40 rounded-xl placeholder-[#0bb]/50 focus:ring-2 focus:ring-[#0bb]"
              />
            </div>

            <div className="flex items-center gap-3">
              <Filter size={18} className="text-[#5599bb]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#172133] text-sm sm:text-base border border-[#0bb]/40 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-[#0bb]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <div className="bg-[#0bb]/20 px-3 py-1 rounded-full border border-[#0bb]/40">
                <span className="text-[#0bb] font-medium">
                  {filteredAndSortedActivities.length} Activities
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE VIEW */}
        {loading ? (
          <div className="bg-[#1a2b46] border border-[#0bb]/40 rounded-xl p-6 sm:p-12 text-center shadow-subtleNeon">
            <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#0bb] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-[#5599bb]">
              Loading your activities...
            </p>
          </div>
        ) : filteredAndSortedActivities.length === 0 ? (
          <div className="bg-[#1a2b46] border border-[#0bb]/40 rounded-xl p-6 sm:p-12 text-center shadow-subtleNeon">
            <Activity
              size={48}
              className="sm:size-16 mx-auto mb-4 sm:mb-6 text-[#0bb]/70"
            />
            <h3 className="text-lg sm:text-2xl font-semibold mb-4 text-[#0bb]">
              {searchTerm ? "No matching activities" : "No activities found"}
            </h3>
            <p className="text-xs sm:text-base text-[#5599bb] mb-6">
              {searchTerm
                ? `No activities match "${searchTerm}". Try a different search term.`
                : "You haven't performed any activities yet. Start exploring the platform!"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-[#0bb] hover:bg-[#14639d] rounded-xl transition-colors text-black font-semibold shadow-neonBtn"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block bg-[#1a2b46] border border-[#0bb]/40 rounded-3xl overflow-hidden shadow-subtleNeon">
              <div className="bg-[#0bb]/20 px-6 py-4 text-[#0bb] font-semibold">
                <div className="grid grid-cols-12 gap-4 text-sm">
                  <div className="col-span-1">#</div>
                  <div className="col-span-1">Type</div>
                  <div className="col-span-7">Activity Description</div>
                  <div className="col-span-3">Timestamp</div>
                </div>
              </div>
              <div className="divide-y divide-[#0bb]/20">
                {filteredAndSortedActivities.map((act, index) => {
                  const activityType = getActivityType(act.description);
                  return (
                    <div
                      key={index}
                      className="px-6 py-4 hover:bg-[#0bb]/10 transition-colors text-sm"
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1 text-[#5599bb] font-medium">
                          {index + 1}
                        </div>
                        <div className="col-span-1">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full border ${getTypeColor(
                              activityType
                            )}`}
                          >
                            {getActivityIcon(act.description)}
                          </span>
                        </div>
                        <div className="col-span-7">
                          <p className="text-white font-medium">
                            {act.description}
                          </p>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full mt-1 border ${getTypeColor(
                              activityType
                            )}`}
                          >
                            {activityType}
                          </span>
                        </div>
                        <div className="col-span-3">
                          <div className="flex items-center gap-2 text-[#5599bb]">
                            <Clock size={14} />
                            <span>{formatNotificationTime(act.time)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MOBILE VIEW */}
            <div className="lg:hidden space-y-4">
              {filteredAndSortedActivities.map((act, index) => {
                const activityType = getActivityType(act.description);
                return (
                  <div
                    key={index}
                    className="bg-[#1a2b46] border border-[#0bb]/40 rounded-3xl p-4 shadow-subtleNeon text-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center justify-center w-12 h-12 rounded-full border ${getTypeColor(
                            activityType
                          )}`}
                        >
                          {getActivityIcon(act.description)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-[#5599bb] font-medium">
                            #{index + 1}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(
                              activityType
                            )}`}
                          >
                            {activityType}
                          </span>
                        </div>
                        <p className="text-white font-medium mb-3 leading-relaxed">
                          {act.description}
                        </p>
                        <div className="flex items-center gap-2 text-[#5599bb] text-xs">
                          <Clock size={12} />
                          <span>{formatNotificationTime(act.time)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUMMARY */}
        {!loading && filteredAndSortedActivities.length > 0 && (
          <div className="mt-8 bg-[#1a2b46] border border-[#0bb]/40 rounded-3xl p-6 shadow-subtleNeon">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#0bb]">
              <Calendar size={20} />
              Activity Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                {
                  label: "Total Activities",
                  value: filteredAndSortedActivities.length,
                  color: "text-[#0bb]",
                },
                {
                  label: "Interactions",
                  value: filteredAndSortedActivities.filter(
                    (act) => getActivityType(act.description) === "interaction"
                  ).length,
                  color: "text-green-400",
                },
                {
                  label: "Content Activities",
                  value: filteredAndSortedActivities.filter(
                    (act) => getActivityType(act.description) === "content"
                  ).length,
                  color: "text-purple-400",
                },
                {
                  label: "Social Activities",
                  value: filteredAndSortedActivities.filter(
                    (act) => getActivityType(act.description) === "social"
                  ).length,
                  color: "text-yellow-400",
                },
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#5599bb]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .shadow-subtleNeon { box-shadow: 0 0 3px #0bb6, 0 0 8px #0bb5a; }
        .shadow-neonBtn { box-shadow: 0 0 4px #0bb8, 0 0 10px #0bb8a; }
      `}</style>
    </div>
  );
}
export default MyActivities;