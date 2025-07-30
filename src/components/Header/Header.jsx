import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Auth/AuthContext";
import Logo from "../../assets/images/Logo.png";
import axios from "../utils/axios";
import { Link } from "react-router-dom";
import {
  Bell,
  MessageCircle,
  SquarePlus,
  Search,
  User,
  Home,
  Settings,
  HelpCircle,
  FileText,
  LogOut,
} from "lucide-react";

function Header() {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(AuthContext);

  const [tagInput, setTagInput] = useState("");
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUnseenMessages, setHasUnseenMessages] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get("/user/profile");
        setCurrentUser(res.data.user);
      } catch (err) {
        console.error("Error fetching current user", err);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUnseen = async () => {
      try {
        const res = await axios.get("/messages/unseen-count");
        setHasUnseenMessages(res.data.unseenCount > 0);
      } catch (err) {
        console.error("Error fetching unseen messages", err);
      }
    };
    fetchUnseen();
  }, []);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const res = await axios.get("/user/notifications");
        const newNotis = res.data.notifications.filter((n) => !n.isGot);
        setUnreadCount(newNotis.length);
      } catch (err) {
        console.error("Error fetching notification count", err);
      }
    };
    fetchNotificationCount();
  }, []);

  const handleTagSearch = async (text) => {
    setTagInput(text);
    if (!text || !currentUser) return setUserSuggestions([]);

    try {
      const res = await axios.get(`/post/search-usernames?q=${text}`);
      const filtered = res.data.filter((user) => user._id !== currentUser._id);
      setUserSuggestions(filtered);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleTagSelect = (user) => {
    navigate(`/user/${user.username}`);
    setTagInput("");
    setUserSuggestions([]);
    setIsSearchFocused(false);
  };

  return (
    <header className="w-full bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 shadow-2xl border-b border-gray-700 sticky top-0 z-50 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between px-6 py-4 gap-y-4 sm:gap-y-0 max-w-7xl mx-auto">
        <div
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="relative">
            <img
              src={Logo}
              alt="Logo"
              className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-xl filter brightness-110"
            />
            <div className="absolute inset-0 bg-cyan-400 opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-300"></div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent hidden sm:block transition-all duration-300 group-hover:from-cyan-300 group-hover:to-blue-300">
            MeetX
          </span>
        </div>

        <div className="w-full sm:max-w-2xl sm:flex-grow sm:mx-6 relative order-3 sm:order-none">
          <div
            className={`relative transition-all duration-300 ${
              isSearchFocused ? "transform scale-105" : ""
            }`}
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search
                className={`h-5 w-5 transition-colors duration-300 ${
                  isSearchFocused ? "text-cyan-400" : "text-gray-500"
                }`}
              />
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => handleTagSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className={`w-full pl-12 pr-4 py-3 bg-gray-800 border-2 rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500 hover:shadow-xl placeholder-gray-400 text-gray-100 ${
                isSearchFocused
                  ? "border-cyan-500 shadow-2xl bg-gray-750"
                  : "border-gray-600 hover:border-gray-500"
              }`}
              placeholder="Search users..."
            />
          </div>

          {userSuggestions.length > 0 && (
            <div className="absolute z-10 bg-gray-800 w-full border border-gray-600 rounded-2xl shadow-2xl mt-2 max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
              {userSuggestions.map((user, index) => (
                <div
                  key={user._id}
                  onClick={() => handleTagSelect(user)}
                  className={`px-6 py-4 hover:bg-gray-700 cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                    index === 0 ? "rounded-t-2xl" : ""
                  } ${
                    index === userSuggestions.length - 1 ? "rounded-b-2xl" : ""
                  } hover:translate-x-1`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-gray-200 font-medium">
                    @{user.username}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/post" className="group relative">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 hover:shadow-xl hover:scale-110 active:scale-95">
              <SquarePlus className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded whitespace-nowrap border border-gray-600">
              Create Post
            </div>
          </Link>

          <Link to="/chat" className="group relative">
            <div className="p-3 bg-gray-800 border-2 border-gray-600 rounded-full shadow-md transition-all duration-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/20 hover:scale-110 active:scale-95 hover:bg-gray-750">
              <MessageCircle className="w-5 h-5 text-cyan-400" />
              {hasUnseenMessages && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse">
                  <span className="absolute w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
                </span>
              )}
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded whitespace-nowrap border border-gray-600">
              Messages
            </div>
          </Link>

          <Link to="/notifications" className="group relative">
            <div className="p-3 bg-gray-800 border-2 border-gray-600 rounded-full shadow-md transition-all duration-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/20 hover:scale-110 active:scale-95 hover:bg-gray-750">
              <Bell className="w-5 h-5 text-cyan-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce min-w-[1.25rem] h-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded whitespace-nowrap border border-gray-600">
              Notifications
            </div>
          </Link>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="group cursor-pointer">
              <div className="p-3 bg-gray-800 border-2 border-gray-600 rounded-full shadow-md transition-all duration-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/20 hover:scale-110 active:scale-95 hover:bg-gray-750">
                <div className="w-5 h-5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
              </div>
            </label>

            <ul
              tabIndex={0}
              className="menu dropdown-content z-[1] mt-4 p-2 shadow-2xl bg-gray-800 rounded-2xl w-64 border border-gray-600 animate-in slide-in-from-top-2 duration-200"
            >
              <li className="mb-1">
                <a
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-700 transition-all duration-200 group"
                >
                  <Home className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors duration-200" />
                  <span className="font-medium text-gray-200 group-hover:text-cyan-300">
                    Home
                  </span>
                </a>
              </li>
              <li className="mb-1">
                <a
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-700 transition-all duration-200 group"
                >
                  <User className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors duration-200" />
                  <span className="font-medium text-gray-200 group-hover:text-cyan-300">
                    Profile
                  </span>
                </a>
              </li>
              <li className="mb-1">
                <a
                  href="/account"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-700 transition-all duration-200 group"
                >
                  <Settings className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors duration-200" />
                  <span className="font-medium text-gray-200 group-hover:text-cyan-300">
                    My Account
                  </span>
                </a>
              </li>
              <li className="mb-1">
                <a
                  href="/help-support"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-700 transition-all duration-200 group"
                >
                  <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors duration-200" />
                  <span className="font-medium text-gray-200 group-hover:text-cyan-300">
                    Help and Support
                  </span>
                </a>
              </li>
              <li className="mb-3">
                <a
                  href="/terms-conditions"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-700 transition-all duration-200 group"
                >
                  <FileText className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors duration-200" />
                  <span className="font-medium text-gray-200 group-hover:text-cyan-300">
                    Terms & Conditions
                  </span>
                </a>
              </li>
              <div className="border-t border-gray-600 pt-2">
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-900/50 transition-all duration-200 group w-full text-left"
                  >
                    <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors duration-200" />
                    <span className="font-medium text-gray-200 group-hover:text-red-300">
                      Logout
                    </span>
                  </button>
                </li>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
