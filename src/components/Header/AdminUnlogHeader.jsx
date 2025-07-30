import React, { useState, useEffect } from "react";
import Logo from "../../assets/images/Logo.png";
import { LogIn, Menu, X, Shield, Home, Info, Mail } from "lucide-react";

function AdminUnlogHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".mobile-menu-container")) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-gray-800/95 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-4 py-3">
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
                MeetX
              </h1>
              <p className="text-xs text-gray-400">Social Media Platform</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <a
              href="/admin/login"
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Admin Login</span>
            </a>
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
                  <div className="space-y-1 mb-4">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-600 rounded-xl transition-all duration-300 flex items-center gap-3 group"
                        >
                          <Icon className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" />
                          <span className="font-medium">{item.label}</span>
                        </a>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-600 pt-3">
                    <a
                      href="/admin/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full px-3 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 flex items-center gap-3"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Admin Login</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .animate-in {
          animation-fill-mode: both;
        }

        .slide-in-from-top-2 {
          animation: slideInFromTop 0.2s ease-out forwards;
        }

        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}

export default AdminUnlogHeader;
