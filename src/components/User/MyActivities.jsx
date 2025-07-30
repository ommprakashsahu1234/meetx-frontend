import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { formatNotificationTime } from "../utils/formatTime";
import { Activity, Clock, Search, Filter, Calendar, Eye, Trash2, RefreshCw } from "lucide-react";

function MyActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

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

  const filteredAndSortedActivities = activities
    .filter(act => 
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
    if (desc.includes('login') || desc.includes('signin')) return '🔐';
    if (desc.includes('post') || desc.includes('share')) return '📝';
    if (desc.includes('like') || desc.includes('heart')) return '❤️';
    if (desc.includes('comment')) return '💬';
    if (desc.includes('follow')) return '👥';
    if (desc.includes('profile') || desc.includes('update')) return '👤';
    if (desc.includes('photo') || desc.includes('image')) return '📷';
    if (desc.includes('video')) return '🎥';
    if (desc.includes('message')) return '💌';
    return '⚡';
  };

  const getActivityType = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('login') || desc.includes('signin')) return 'security';
    if (desc.includes('post') || desc.includes('share')) return 'content';
    if (desc.includes('like') || desc.includes('comment')) return 'interaction';
    if (desc.includes('follow')) return 'social';
    if (desc.includes('profile')) return 'account';
    return 'general';
  };

  const getTypeColor = (type) => {
    const colors = {
      security: 'bg-red-500/20 text-red-400 border-red-500/30',
      content: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      interaction: 'bg-green-500/20 text-green-400 border-green-500/30',
      social: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      account: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      general: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[type] || colors.general;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Activity size={32} className="text-white" />
                <h1 className="text-3xl md:text-4xl font-bold">My Activities</h1>
              </div>
              <p className="text-blue-100 text-lg">
                Track your recent actions and interactions on the platform
              </p>
            </div>
            <button
              onClick={refreshActivities}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <Filter size={18} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="bg-blue-600/20 px-3 py-1 rounded-full border border-blue-600/30">
                <span className="text-blue-400 font-medium">
                  {filteredAndSortedActivities.length} Activities
                </span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your activities...</p>
          </div>
        ) : filteredAndSortedActivities.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <Activity size={64} className="mx-auto mb-6 text-gray-400" />
            <h3 className="text-2xl font-semibold mb-4">
              {searchTerm ? "No matching activities" : "No activities found"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? `No activities match "${searchTerm}". Try a different search term.`
                : "You haven't performed any activities yet. Start exploring the platform!"
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hidden lg:block bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-6 py-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-300">
                  <div className="col-span-1">#</div>
                  <div className="col-span-1">Type</div>
                  <div className="col-span-7">Activity Description</div>
                  <div className="col-span-3">Timestamp</div>
                </div>
              </div>
              <div className="divide-y divide-gray-700">
                {filteredAndSortedActivities.map((act, index) => {
                  const activityType = getActivityType(act.description);
                  return (
                    <div key={index} className="px-6 py-4 hover:bg-gray-750 transition-colors">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1 text-gray-400 font-medium">
                          {index + 1}
                        </div>
                        <div className="col-span-1">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border ${getTypeColor(activityType)}`}>
                            {getActivityIcon(act.description)}
                          </span>
                        </div>
                        <div className="col-span-7">
                          <p className="text-white font-medium">{act.description}</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 border ${getTypeColor(activityType)}`}>
                            {activityType}
                          </span>
                        </div>
                        <div className="col-span-3">
                          <div className="flex items-center gap-2 text-gray-400">
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

            <div className="lg:hidden space-y-4">
              {filteredAndSortedActivities.map((act, index) => {
                const activityType = getActivityType(act.description);
                return (
                  <div key={index} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full border ${getTypeColor(activityType)}`}>
                          {getActivityIcon(act.description)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400 font-medium">#{index + 1}</span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(activityType)}`}>
                            {activityType}
                          </span>
                        </div>
                        <p className="text-white font-medium mb-3 leading-relaxed">
                          {act.description}
                        </p>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
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
        )}

        {!loading && filteredAndSortedActivities.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Activity Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">{filteredAndSortedActivities.length}</div>
                <div className="text-sm text-gray-400">Total Activities</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {filteredAndSortedActivities.filter(act => getActivityType(act.description) === 'interaction').length}
                </div>
                <div className="text-sm text-gray-400">Interactions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {filteredAndSortedActivities.filter(act => getActivityType(act.description) === 'content').length}
                </div>
                <div className="text-sm text-gray-400">Content Activities</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {filteredAndSortedActivities.filter(act => getActivityType(act.description) === 'social').length}
                </div>
                <div className="text-sm text-gray-400">Social Activities</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyActivities;