import React from "react";
import { Link } from "react-router-dom";
import { 
  Settings, 
  CheckCircle, 
  Bell, 
  ArrowRight,
  Shield,
  Users,
  Megaphone,
  Star
} from "lucide-react";

const OtherActions = () => {
  const actions = [
    {
      title: "Set Verification Status",
      description: "Manage user verification badges and trusted status",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-400 hover:to-emerald-500",
      link: "/admin/set-verification",
      emoji: "✅",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      title: "Release Notice",
      description: "Send platform-wide announcements and notifications",
      icon: Bell,
      color: "from-blue-500 to-cyan-600",
      hoverColor: "hover:from-blue-400 hover:to-cyan-500",
      link: "/admin/notify",
      emoji: "📝",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-gray-500 to-slate-600 rounded-2xl">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Other Administrative Actions</h1>
            <p className="text-gray-400">Additional tools and administrative functions</p>
          </div>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.link}
                className="group block"
                style={{
                  animationDelay: `${index * 150}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className={`${action.bgColor} ${action.borderColor} border rounded-3xl p-8 hover:bg-opacity-20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group relative overflow-hidden`}>
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`}></div>
                  
                  <div className="relative z-10">
                    {/* Icon and emoji */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-4 bg-gradient-to-r ${action.color} rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-300">
                        {action.emoji}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-100 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300 mb-3">
                        {action.title}
                      </h3>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                        {action.description}
                      </p>
                    </div>

                    {/* Action button */}
                    <div className={`px-6 py-3 bg-gradient-to-r ${action.color} ${action.hoverColor} text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-between group-hover:shadow-2xl`}>
                      <span>Access Tool</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>



        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-cyan-500/20 border border-cyan-500/30 rounded-xl flex-shrink-0">
              <Settings className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">Administrative Guidelines</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Use these tools responsibly. Verification status should be granted to trusted users who contribute positively to the community. 
                Release notices should be used for important platform updates and announcements only.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default OtherActions;
