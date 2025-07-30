import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AdminContext } from "../Auth/AdminContext";
import Logo from "../../assets/images/Logo.png";
import { isAdminTokenValid } from "../Auth/adminAuth";
import {
  Settings,
  Menu,
  Bell,
  LayoutDashboard,
  Users,
  Flag,
  LogOut,
  Shield,
  X,
  ChevronDown,
} from "lucide-react";

function AdminHeader() {
  const navigate = useNavigate();
  const { setIsAdminLoggedIn, admin, setAdmin } = useContext(AdminContext);
  const [loaded, setLoaded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAdminTokenValid()) {
      localStorage.removeItem("admin-token");
      localStorage.removeItem("admin");
      setIsAdminLoggedIn(false);
      setAdmin(null);
      navigate("/admin/login");
    } else {
      setLoaded(true);
    }
  }, [navigate, setIsAdminLoggedIn, setAdmin]);

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    localStorage.removeItem("admin");
    setIsAdminLoggedIn(false);
    setAdmin(null);
    navigate("/admin/login");
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setDropdownOpen(false);
      }
      if (!event.target.closest(".mobile-menu-container")) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigationItems = [
  ];

  if (!loaded) {
    return (
      <div className="w-full h-16 bg-gray-800/80 backdrop-blur-md border-b border-gray-700 animate-pulse">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
            <div className="w-32 h-6 bg-gray-700 rounded"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-8 bg-gray-700 rounded-xl"></div>
            <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <header className="w-full bg-gray-800/95 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-gray-600 shadow-lg">
                <img
                  src={Logo}
                  alt="Logo"
                  className="w-full h-full object-contain bg-gradient-to-br from-gray-700 to-gray-800"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                MeetX Admin
              </h1>
              <p className="text-xs text-gray-400">Administrative Dashboard</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/admin/notify"
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span className="text-sm">Release Notification</span>
            </Link>

            <div className="dropdown-container relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-xl hover:bg-gray-600 hover:border-cyan-500 transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-all duration-300 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-700 border border-gray-600 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-gray-600 mb-2">
                      <p className="text-sm font-medium text-gray-100">
                        Admin Panel
                      </p>
                      <p className="text-xs text-gray-400">
                        Manage your platform
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all duration-300 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:hidden mobile-menu-container relative">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-xl hover:bg-gray-600 hover:border-cyan-500 transition-all duration-300"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {mobileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-gray-700 border border-gray-600 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="p-3">
                  <div className="space-y-1 mb-3">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-600 rounded-xl transition-all duration-300 flex items-center gap-3 group"
                        >
                          <Icon className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  <Link
                    to="/admin/notify"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-3 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 flex items-center gap-3 mb-3"
                  >
                    <Bell className="w-5 h-5" />
                    <span>Release Notification</span>
                  </Link>

                  <div className="border-t border-gray-600 pt-3">
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-3 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all duration-300 flex items-center gap-3"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
