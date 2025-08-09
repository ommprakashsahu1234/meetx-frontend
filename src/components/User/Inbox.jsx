import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useAuth } from "../Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import verifiedIcon from "../../assets/images/verified.svg";
import { Search, MessageCircle, Users, Send, Inbox as InboxIcon } from "lucide-react";

function Inbox() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);

  const neonStyle = { filter: "drop-shadow(0 0 1.5px #099) drop-shadow(0 0 3px #099)" };

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const res = await axios.get("/messages/chat-users");
        setChatUsers(res.data.users);
      } catch (err) {
        console.error("Failed to load chat users", err);
      }
    };
    if (user) fetchChatUsers();
  }, [user]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchInput) return setSuggestions([]);
      try {
        const res = await axios.get(`/messages/search-usernames?q=${searchInput}`);
        const filtered = res.data.filter((u) => u._id !== user._id);
        setSuggestions(filtered);
      } catch (err) {
        console.error("Search error", err);
      }
    };
    fetchSuggestions();
  }, [searchInput, user?._id]);

  const handleUserClick = (username) => {
    navigate(`/chat/${username}`);
  };

  return (
    <div className="min-h-screen bg-[#172133] p-4 text-[#0bb]">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-6 shadow-subtleNeon flex items-center gap-3 backdrop-blur-md">
            <div className="p-3 bg-gradient-to-r from-[#0bb] to-[#145279] rounded-2xl shadow-subtleNeonBtn">
              <InboxIcon className="w-6 h-6 text-white" style={neonStyle} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0bb] to-[#145279] bg-clip-text text-transparent">
                Inbox
              </h1>
              <p className="text-[#5588aa]">Connect and chat with friends</p>
            </div>
          </div>
        </div>

        {/* SEARCH USERS */}
        <div className="mb-8">
          <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-6 shadow-subtleNeon backdrop-blur-md">
            <label className="block text-sm font-medium text-[#88bbdd] mb-3">Search Users</label>
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4488bb] w-5 h-5 group-focus-within:text-[#0bb] transition-colors duration-300"
                style={neonStyle}
              />
              <input
                type="text"
                placeholder="Search for users to chat with..."
                className="w-full pl-12 pr-4 py-4 bg-[#1a2b46] border-2 border-[#1f2a47] rounded-2xl text-[#0bb] placeholder-[#0a4d74] focus:outline-none focus:border-[#0bb] focus:ring-4 focus:ring-[#0bb]/30 transition-all duration-300 hover:border-[#145279]"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {suggestions.length > 0 && (
              <div className="mt-4 bg-[#1a2b46] border border-[#1f2a47] rounded-2xl overflow-hidden">
                {suggestions.map((u, index) => (
                  <div
                    key={u._id}
                    className={`px-4 py-3 hover:bg-[#273b62] cursor-pointer transition-all duration-300 ${
                      index !== suggestions.length - 1 ? "border-b border-[#1f2a47]" : ""
                    }`}
                    onClick={() => handleUserClick(u.username)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1f2a47] hover:border-[#0bb] transition-colors duration-300">
                        <img
                          src={u.profileImageURL}
                          alt={u.username}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[#0bb] font-medium hover:text-[#0dd] transition-colors duration-300">
                            @{u.username}
                          </span>
                          {u.isVerified && (
                            <img src={verifiedIcon} alt="Verified" className="w-4 h-4" draggable={false} />
                          )}
                        </div>
                        <p className="text-sm text-[#88bbdd]">{u.name}</p>
                      </div>
                      <Send className="w-4 h-4 text-[#4488bb] group-hover:text-[#0bb]" style={neonStyle} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RECENT CHATS */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 bg-gradient-to-r from-[#0bb] to-[#145279] rounded-xl shadow-subtleNeonBtn">
              <MessageCircle className="w-4 h-4 text-white" style={neonStyle} />
            </div>
            <h2 className="text-xl font-semibold text-[#0bb]">Recent Chats</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#1f2a47] to-transparent"></div>
          </div>

          {chatUsers.length > 0 ? (
            <div className="space-y-4">
              {chatUsers.map((u) => (
                <div
                  key={u._id}
                  className="group bg-[#172133] border border-[#1f2a47] rounded-2xl p-4 shadow-subtleNeon hover:shadow-subtleNeonHover cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-[#0bb]/40"
                  onClick={() => handleUserClick(u.username)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#1f2a47] group-hover:border-[#0bb] transition-colors">
                        <img
                          src={u.profileImageURL}
                          alt={u.username}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </div>
                      {u.hasUnseen && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-[#172133] flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#0bb] group-hover:text-[#0dd] transition-colors truncate">
                          @{u.username}
                        </span>
                        {u.isVerified && (
                          <img src={verifiedIcon} alt="Verified" className="w-4 h-4 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-[#88bbdd] truncate text-left">{u.name}</p>
                    </div>
                    <div className="flex-shrink-0 p-2 bg-[#1a2b46] rounded-xl group-hover:bg-gradient-to-r group-hover:from-[#0bb] group-hover:to-[#145279] transition-all">
                      <MessageCircle className="w-5 h-5 text-[#4488bb] group-hover:text-white" style={neonStyle} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#172133] border border-[#1f2a47] rounded-3xl p-12 shadow-subtleNeon text-center backdrop-blur-md">
              <div className="p-6 bg-[#1a2b46] rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Users className="w-12 h-12 text-[#4488bb]" style={neonStyle} />
              </div>
              <h3 className="text-2xl font-bold text-[#88bbdd] mb-2">No chats yet</h3>
              <p className="text-[#5588aa] text-lg mb-6">
                Search for users above to start a conversation
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0bb] to-[#145279] text-white font-semibold rounded-2xl shadow-subtleNeonBtn hover:from-[#099] hover:to-[#0a4d74] hover:scale-105">
                <Search className="w-5 h-5" />
                <span>Start Chatting</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .shadow-subtleNeon { box-shadow: 0 0 2px #099, 0 0 6px #0991a; }
        .shadow-subtleNeonHover { box-shadow: 0 0 3px #0bb, 0 0 9px #0bb2a; }
        .shadow-subtleNeonBtn { box-shadow: 0 0 2px #0bb4a; }
      `}</style>
    </div>
  );
}

export default Inbox;
