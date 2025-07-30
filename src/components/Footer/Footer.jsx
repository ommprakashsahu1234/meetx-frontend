import React from "react";
import { Link } from "react-router-dom";
import { Globe, Heart, Info, Copyright, ExternalLink } from "lucide-react";

function Footer() {
  return (
    <footer className="relative mt-auto bg-gray-800/95 backdrop-blur-md border-t border-gray-700 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 text-gray-400 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <Copyright className="w-4 h-4" />
              <span>2025</span>
            </div>
            <span className="whitespace-nowrap">
              Made with
              <Heart className="w-4 h-4 text-red-400 inline mx-1 animate-pulse" />
              by{" "}
              <span className="text-cyan-400 font-semibold truncate max-w-xs sm:max-w-none">
                Omm Prakash Sahu
              </span>
            </span>
          </div>

          {/* Center: App Name with Icon */}
          <div className="flex items-center gap-2 text-sm sm:text-base mt-2 sm:mt-0">
            <div className="p-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex-shrink-0">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text font-bold whitespace-nowrap">
              MeetX Application
            </span>
          </div>

          {/* Right Side: About Us Link */}
          <Link
            to="/about"
            className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Info className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium">About Us</span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </div>

        {/* Mobile text version under the main row */}
        <div className="sm:hidden flex items-center justify-center mt-2 pt-2 border-t border-gray-600/50 text-xs text-gray-500 select-none">
          Social Media Platform • v2.0
        </div>
      </div>

      {/* Top thin gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
    </footer>
  );
}

export default Footer;
