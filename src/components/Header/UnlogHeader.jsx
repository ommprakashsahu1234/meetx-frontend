import React from "react";
import Logo from "../../assets/images/Logo.png";
import { Menu, HelpCircle, Rocket } from "lucide-react";

function UnlogHeader() {
  return (
    <div className="w-full bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 shadow-2xl border-b border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
      <div
        className="flex items-center gap-3 group cursor-pointer"
        onClick={() => (window.location.href = "/")}
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

      <div className="flex items-center gap-3">
        <a
          href="/login"
          className="px-6 py-2.5 bg-transparent border-2 border-cyan-400 text-cyan-400 rounded-full font-semibold transition-all duration-300 hover:bg-cyan-400 hover:text-gray-900 hover:shadow-lg hover:shadow-cyan-400/25 hover:scale-105 active:scale-95 text-sm sm:text-base sm:px-8 sm:py-3"
        >
          Login
        </a>
        <a
          href="/register"
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-semibold transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 text-sm sm:text-base sm:px-8 sm:py-3"
        >
          Register
        </a>
      </div>

      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="group cursor-pointer">
          <div className="p-3 bg-gray-800 border-2 border-gray-600 rounded-full shadow-md transition-all duration-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/20 hover:scale-110 active:scale-95 hover:bg-gray-750">
            <Menu className="h-5 w-5 text-cyan-400" />
          </div>
        </label>

        <ul
          tabIndex={0}
          className="menu dropdown-content z-[1] mt-4 p-2 shadow-2xl bg-gray-800 rounded-2xl w-56 border border-gray-600 animate-in slide-in-from-top-2 duration-200"
        >
          <li>
            <a
              href="terms-conditions"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-700 transition-all duration-200 group"
            >
              <Rocket className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors duration-200" />
              <span className="font-medium text-gray-200 group-hover:text-cyan-300">
                Terms And Conditions
              </span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default UnlogHeader;
