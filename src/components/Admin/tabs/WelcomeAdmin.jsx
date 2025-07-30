import React from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Crown,
  ArrowRight
} from "lucide-react";

const WelcomeAdmin = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
              Welcome Admin!
            </h1>
            <p className="text-gray-400 text-lg">
              Your administrative control center
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl flex-shrink-0">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-xl leading-8 text-gray-100">
              Here in the Admin Panel, you have full control over the backend operations of the MeetX platform. You can monitor and manage user activities, moderate content, take action against reported users or posts, and maintain the platform's integrity and safety. This panel empowers you to review complaints, set verification statuses for trusted users, publish important release notes, and handle manual administrative tasks with ease. Every decision made here directly impacts the user experience and the quality of interactions on the platform. As an admin, it's your responsibility to ensure a fair, respectful, and engaging community environment. You can ban or unban users, investigate reports, and take swift actions on abusive or inappropriate content. This central hub is designed to streamline all backend tasks efficiently so you can focus on keeping MeetX a secure and enjoyable platform for everyone. Navigate through the tools on the sidebar to get started with your tasks.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Hint */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <ArrowRight className="w-5 h-5 text-cyan-400" />
          <p className="text-cyan-300 font-medium">
            Use the sidebar navigation to access different administrative tools and features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAdmin;
