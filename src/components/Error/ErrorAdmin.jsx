import React from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Search,
  ArrowLeft,
  AlertTriangle,
  Construction,
  Zap,
  Globe,
  RefreshCw,
} from "lucide-react";

function ErrorAdmin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.15),transparent_50%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
        <div
          className="absolute top-40 right-20 w-1 h-1 bg-blue-400 rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-3 h-3 bg-indigo-400 rounded-full animate-ping"
          style={{ animationDelay: "3s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-ping"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <div className="bg-gray-800/95 border border-gray-700 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-md">
          <div className="relative mb-8">
            <div className="relative inline-block">
              {/* Glowing Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 opacity-30 blur-xl scale-150 animate-pulse"></div>

              {/* Main Icon Container */}
              <div className="relative p-8 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30 rounded-full backdrop-blur-md">
                <div className="animate-bounce">
                  <AlertTriangle
                    className="w-20 h-20 text-cyan-400"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Orbiting Elements */}
                <div
                  className="absolute inset-0 animate-spin"
                  style={{ animationDuration: "20s" }}
                >
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full opacity-60"></div>
                  <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-indigo-400 rounded-full opacity-60"></div>
                  <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-2 h-2 bg-cyan-300 rounded-full opacity-60"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-8xl sm:text-9xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text mb-4 tracking-tight leading-none animate-pulse">
              404
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full mb-6"></div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
              The page you're looking for seems to have vanished into the
              digital void. Don't worry, even the best explorers sometimes take
              a wrong turn in cyberspace.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              to="/admin"
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Back to Home</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="group px-8 py-4 bg-gray-700 border border-gray-600 text-gray-100 font-semibold rounded-2xl hover:bg-gray-600 hover:border-cyan-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Additional Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Link
              to="/terms-conditions"
              className="group p-4 bg-gray-700/50 border border-gray-600 rounded-2xl hover:bg-gray-600/50 hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Construction className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-gray-100 group-hover:text-green-400 transition-colors duration-300">
                    Terms And Conditions
                  </h3>
                  <p className="text-xs text-gray-400">Convince You Fit</p>
                </div>
              </div>
            </Link>

            <Link
              to="/contact"
              className="group p-4 bg-gray-700/50 border border-gray-600 rounded-2xl hover:bg-gray-600/50 hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-gray-100 group-hover:text-purple-400 transition-colors duration-300">
                    Help Center
                  </h3>
                  <p className="text-xs text-gray-400">Get assistance</p>
                </div>
              </div>
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="group p-4 bg-gray-700/50 border border-gray-600 rounded-2xl hover:bg-gray-600/50 hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-gray-100 group-hover:text-orange-400 transition-colors duration-300">
                    Refresh
                  </h3>
                  <p className="text-xs text-gray-400">Try again</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Message */}
        <div className="mt-8 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 text-cyan-300">
            <Globe
              className="w-5 h-5 animate-spin"
              style={{ animationDuration: "3s" }}
            />
            <p className="text-sm font-medium">
              Lost in the digital universe? We'll help you find your way back.
            </p>
          </div>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default ErrorAdmin;
