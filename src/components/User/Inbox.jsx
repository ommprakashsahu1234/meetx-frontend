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

  useEffect(() => {
    if (chatUsers.length) {
      console.log("chatUsers[0]:", chatUsers[0]);
      console.log("isVerified:", chatUsers[0].isVerified);
    }
  }, [chatUsers]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const res = await axios.get("/messages/chat-users");
        console.log("Fetched chat users:", res.data.users);
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
        const res = await axios.get(
          `/messages/search-usernames?q=${searchInput}`
        );
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
                <InboxIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Inbox
                </h1>
                <p className="text-gray-400">Connect and chat with friends</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Search Users
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-cyan-400" />
                <input
                  type="text"
                  placeholder="Search for users to chat with..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-700 border-2 border-gray-600 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:border-gray-500"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>

            {suggestions.length > 0 && (
              <div className="mt-4">
                <div className="bg-gray-700/50 border border-gray-600 rounded-2xl overflow-hidden">
                  {suggestions.map((u, index) => (
                    <div
                      key={u._id}
                      className={`px-4 py-3 hover:bg-gray-600/50 cursor-pointer transition-all duration-300 group ${
                        index !== suggestions.length - 1 ? "border-b border-gray-600" : ""
                      }`}
                      onClick={() => handleUserClick(u.username)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-cyan-400 transition-colors duration-300">
                          <img
                            src={u.profileImageURL}
                            alt={u.username}
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-100 font-medium group-hover:text-cyan-400 transition-colors duration-300">
                              @{u.username}
                            </span>
                            {u.isVerified && (
                              <img
                                src={verifiedIcon}
                                alt="Verified"
                                className="w-4 h-4"
                                draggable={false}
                              />
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{u.name}</p>
                        </div>
                        <Send className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors duration-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-100">Recent Chats</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-600/50 to-transparent"></div>
          </div>

          {chatUsers.length > 0 ? (
            <div className="space-y-4">
              {chatUsers.map((u) => (
                <div
                  key={u._id}
                  className="group bg-gray-800 border border-gray-700 rounded-2xl p-4 shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-gray-600"
                  onClick={() => handleUserClick(u.username)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-cyan-400 transition-colors duration-300">
                        <img
                          src={u.profileImageURL}
                          alt={u.username}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </div>
                      {u.hasUnseen && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-100 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300 truncate">
                          @{u.username}
                        </span>
                        {u.isVerified && (
                          <img
                            src={verifiedIcon}
                            alt="Verified"
                            className="w-4 h-4 flex-shrink-0"
                            draggable={false}
                          />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">{u.name}</p>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="p-2 bg-gray-700 rounded-xl group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-blue-600 transition-all duration-300">
                        <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-12 shadow-2xl backdrop-blur-md text-center">
              <div className="p-6 bg-gray-700/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-2">No chats yet</h3>
              <p className="text-gray-400 text-lg mb-6">
                Search for users above to start a conversation
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:scale-105">
                <Search className="w-5 h-5" />
                <span>Start Chatting</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Inbox;
