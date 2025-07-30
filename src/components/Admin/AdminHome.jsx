import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAdminTokenValid } from "../Auth/adminAuth";
import ManageUsers from "./tabs/ManageUsers";
import PostReports from "./tabs/PostReports";
import UserReports from "./tabs/UserReports";
import AdminComplaints from "./tabs/AdminComplaints";
import OtherActions from "./tabs/OtherActions";
import WelcomeAdmin from "./tabs/WelcomeAdmin";
import { 
  LayoutDashboard,
  Users,
  FileText,
  UserSearch,
  MessageSquare,
  Settings,
  Menu,
  X,
  ChevronRight,
  Shield
} from "lucide-react";

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState("welcomeAdmin");
  // Start sidebar open by default on laptop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Update sidebarOpen state on window resize (to ensure correctness)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // on laptop and larger show sidebar icon+text by default
      } else {
        setSidebarOpen(false); // on smaller hide sidebar
      }
    };
    window.addEventListener("resize", handleResize);
    // initial call
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isAdminTokenValid()) {
      navigate("/admin/login");
    } else {
      setLoading(false);
    }
  }, [navigate]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 1024 && sidebarOpen) {
        const sidebar = document.getElementById('admin-sidebar');
        // if click outside sidebar and not on toggle button
        if (sidebar && !sidebar.contains(event.target) && !event.target.closest('.sidebar-toggle')) {
          setSidebarOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const tabConfig = [
    {
      id: "welcomeAdmin",
      label: "Welcome Admin",
      icon: LayoutDashboard,
      component: WelcomeAdmin,
      color: "from-cyan-500 to-blue-600"
    },
    {
      id: "manageUsers",
      label: "Manage Users",
      icon: Users,
      component: ManageUsers,
      color: "from-purple-500 to-pink-600"  
    },
    {
      id: "postReports",
      label: "Post Reports",
      icon: FileText,
      component: PostReports,
      color: "from-orange-500 to-red-600"
    },
    {
      id: "userReports", 
      label: "User Reports",
      icon: UserSearch,
      component: UserReports,
      color: "from-yellow-500 to-orange-600"
    },
    {
      id: "complaints",
      label: "Complaints",
      icon: MessageSquare,
      component: AdminComplaints,
      color: "from-green-500 to-emerald-600"
    },
    {
      id: "otherActions",
      label: "Other Actions", 
      icon: Settings,
      component: OtherActions,
      color: "from-gray-500 to-slate-600"
    }
  ];

  // Clicking tab sets active tab and closes sidebar on mobile only
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const renderTab = () => {
    const activeTabConfig = tabConfig.find(tab => tab.id === activeTab);
    if (activeTabConfig) {
      const Component = activeTabConfig.component;
      return <Component />;
    }
    return <WelcomeAdmin />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3 md:mb-4"></div>
          <p className="text-gray-300 text-base md:text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="flex min-h-screen relative">

        {/* Mobile Overlay */}
        {sidebarOpen && window.innerWidth < 1024 && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div 
          id="admin-sidebar"
          className={`
            fixed lg:relative top-0 left-0 h-full bg-gray-800/95 backdrop-blur-md border-r border-gray-700 shadow-2xl flex flex-col z-50 transition-all duration-300
            ${
              window.innerWidth < 1024
                ? (sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72')
                : (sidebarOpen ? 'w-80' : 'w-20')
            }
          `}
        >
          {/* Sidebar Header */}
          <div className={`p-4 lg:p-6 border-b border-gray-700 flex items-center justify-between gap-3`}>
            <div className={`flex items-center gap-2 ${!sidebarOpen && window.innerWidth >= 1024 ? 'justify-center w-full' : ''}`}>
              <div className="p-1.5 lg:p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg lg:rounded-xl">
                <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              {(sidebarOpen || window.innerWidth < 1024) && (
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                    Admin Panel
                  </h2>
                  <p className="text-xs text-gray-400">Management Dashboard</p>
                </div>
              )}
            </div>

            {/* Toggle button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="sidebar-toggle p-1.5 lg:p-2 bg-gray-700 border border-gray-600 rounded-lg lg:rounded-xl hover:bg-gray-600 hover:border-cyan-500 transition-all duration-300 group"
            >
              {sidebarOpen ? (
                <X className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-cyan-400" />
              ) : (
                <Menu className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-cyan-400" />
              )}
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 p-3 lg:p-4 space-y-1.5 lg:space-y-2 overflow-y-auto">
            {tabConfig.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full group relative overflow-hidden rounded-xl lg:rounded-2xl transition-all duration-300
                    ${
                      isActive
                        ? 'bg-gradient-to-r ' + tab.color + ' shadow-lg transform scale-[1.02]'
                        : 'bg-gray-700/50 hover:bg-gray-600 border border-gray-600 hover:border-gray-500'
                    }
                  `}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInLeft 0.5s ease-out forwards'
                  }}
                >
                  <div className="flex items-center p-3 lg:p-4 justify-start">
                    <div className={`p-1.5 lg:p-2 rounded-lg lg:rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20' 
                        : 'bg-gray-600 group-hover:bg-gray-500'
                    }`}>
                      <Icon className={`w-4 h-4 lg:w-5 lg:h-5 transition-all duration-300 ${
                        isActive 
                          ? 'text-white' 
                          : 'text-gray-400 group-hover:text-cyan-400'
                      }`} />
                    </div>
                    {/* Show label only if sidebar is open or on mobile */}
                    {(sidebarOpen || window.innerWidth < 1024) && (
                      <span className={`ml-2 lg:ml-3 font-medium transition-all duration-300 text-sm lg:text-base ${
                        isActive 
                          ? 'text-white' 
                          : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {tab.label}
                      </span>
                    )}
                    {isActive && sidebarOpen && (
                      <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-white ml-auto" />
                    )}
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 lg:h-8 bg-white rounded-r-full"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 lg:p-4 border-t border-gray-700">
            {(sidebarOpen || window.innerWidth < 1024) ? (
              <div className="bg-gray-700/50 border border-gray-600 rounded-xl lg:rounded-2xl p-3 lg:p-4">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-gray-100">System Status</p>
                    <p className="text-xs text-gray-400">All systems operational</p>
                  </div>
                </div>
              </div>
            ) : (
              // When minimized sidebar on laptop, just a small pulse dot centered
              <div className="flex justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Content Header */}
          <div className="p-4 lg:p-6 border-b border-gray-700 bg-gray-800/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              {/* Mobile toggle button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="sidebar-toggle lg:hidden p-2 bg-gray-700 border border-gray-600 rounded-xl hover:bg-gray-600 hover:border-cyan-500 transition-all duration-300"
                >
                  <Menu className="w-5 h-5 text-gray-400" />
                </button>

                {(() => {
                  const activeTabConfig = tabConfig.find(tab => tab.id === activeTab);
                  const Icon = activeTabConfig?.icon || LayoutDashboard;
                  return (
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className={`p-2 lg:p-3 bg-gradient-to-r ${activeTabConfig?.color || 'from-cyan-500 to-blue-600'} rounded-xl lg:rounded-2xl`}>
                        <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-100">
                          {activeTabConfig?.label || 'Welcome Admin'}
                        </h1>
                        <p className="text-xs sm:text-sm lg:text-base text-gray-400 hidden sm:block">
                          {activeTab === "welcomeAdmin" && "Overview and quick actions"}
                          {activeTab === "manageUsers" && "User management and controls"}
                          {activeTab === "postReports" && "Review reported posts"}
                          {activeTab === "userReports" && "Review reported users"}
                          {activeTab === "complaints" && "Handle user complaints"}
                          {activeTab === "otherActions" && "Additional admin tools"}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="hidden lg:flex items-center gap-4">
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-400">Online</p>
                    <p className="text-xs text-gray-400">Status</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 p-3 lg:p-6 overflow-y-auto bg-gray-800/30">
            <div className="max-w-full">
              {renderTab()}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Custom scrollbar for sidebar */
        nav::-webkit-scrollbar {
          width: 4px;
        }

        nav::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 10px;
        }

        nav::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 10px;
        }

        nav::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </div>
  );
};

export default AdminHome;
