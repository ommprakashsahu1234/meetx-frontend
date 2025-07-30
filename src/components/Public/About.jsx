import React from "react";
import {
  Users,
  Shield,
  MessageCircle,
  Bell,
  Eye,
  Heart,
  Upload,
  Settings,
  Database,
  Server,
  Globe,
  Zap,
  UserCheck,
  Lock,
  Flag,
  Mail,
  Activity,
  UserPlus,
  Image as ImageIcon,
  Video,
  FileText,
  CheckCircle,
  Star,
  Crown,
  Code,
  Smartphone,
} from "lucide-react";

function About() {
  const userFeatures = [
    {
      title: "Registration & Login",
      description:
        "Sign up with username, email, password, and mobile number. Email-based login with JWT authentication. User verification system with badges for verified users.",
      icon: UserPlus,
      color: "from-cyan-500 to-blue-600",
    },
    {
      title: "Profile Management",
      description:
        "Update profile details including bio, gender, etc. View other users' profiles.",
      icon: Users,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Posting System",
      description:
        "Upload posts with image or video support. Add captions and set visibility (public, followers only, private). View, edit, and delete own posts.",
      icon: Upload,
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Interactions",
      description:
        "Like and comment on posts. Real-time updates for likes and comments. View total likes, comments, and views on a post.",
      icon: Heart,
      color: "from-pink-500 to-red-600",
    },
    {
      title: "Messaging & Chat",
      description:
        "Real-time one-on-one chat using Socket.IO. Message history and chat timestamps.",
      icon: MessageCircle,
      color: "from-green-500 to-teal-600",
    },
    {
      title: "Notifications",
      description:
        "Real-time notifications for likes, comments, follows, and reports. Mark notifications as read. Notification badges.",
      icon: Bell,
      color: "from-yellow-500 to-orange-600",
    },
    {
      title: "Activity Log",
      description:
        "Track personal actions: posts, likes, comments, reports, and account registration. Activities displayed chronologically.",
      icon: Activity,
      color: "from-indigo-500 to-purple-600",
    },
    {
      title: "Following System",
      description:
        "Follow or unfollow users. View followers and following lists. Private post visibility limited to followers only.",
      icon: UserCheck,
      color: "from-teal-500 to-cyan-600",
    },
    {
      title: "Reporting System",
      description:
        "Report users or posts with a reason. Submit complaints to the admin (via a contact/complaint form).",
      icon: Flag,
      color: "from-red-500 to-pink-600",
    },
    {
      title: "Accessibility & UI",
      description:
        "Responsive design across all devices (mobile, tablet, desktop). Optimized image/video display. Dropdown menus, modals, and intuitive navigation.",
      icon: Smartphone,
      color: "from-gray-500 to-slate-600",
    },
  ];

  const adminFeatures = [
    {
      title: "Admin Authentication",
      description:
        "Separate admin login system. JWT-secured routes for admin actions.",
      icon: Shield,
      color: "from-cyan-500 to-blue-600",
    },
    {
      title: "User Management",
      description:
        "View all registered users. Ban/unban users with a recorded reason. View user details including profile image, bio, verification, and ban status.",
      icon: Users,
      color: "from-purple-500 to-indigo-600",
    },
    {
      title: "Post Management",
      description:
        "View all posts from all users. Delete reported or inappropriate posts. See post media, captions, author info, and engagement data.",
      icon: FileText,
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: "Report Handling",
      description:
        "View reported users and reported posts. See list of reports with reporter's name, image, and reason. Take action (e.g., ban user, delete post).",
      icon: Flag,
      color: "from-red-500 to-orange-600",
    },
    {
      title: "Complaint Management",
      description:
        "View and respond to complaints submitted by users. Contact complainants if needed.",
      icon: Mail,
      color: "from-green-500 to-teal-600",
    },
    {
      title: "User Verification",
      description:
        "See list of all users with verification status. Verify or unverify users manually via admin panel.",
      icon: Crown,
      color: "from-yellow-500 to-amber-600",
    },
  ];

  const techHighlights = [
    {
      title: "MERN Stack",
      description: "MongoDB, Express.js, React.js, Node.js",
      icon: Code,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Real-Time Features",
      description: "Powered by Socket.IO for chat",
      icon: Zap,
      color: "from-yellow-500 to-orange-600",
    },
    {
      title: "Media Upload",
      description: "ImageKit used for efficient media uploads",
      icon: ImageIcon,
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Email System",
      description: "Nodemailer used for notifications",
      icon: Mail,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Modern UI",
      description: "Clean design with responsive layouts",
      icon: Globe,
      color: "from-cyan-500 to-teal-600",
    },
    {
      title: "Database",
      description: "MongoDB for scalable data storage",
      icon: Database,
      color: "from-gray-500 to-slate-600",
    },
  ];

  const privacyFeatures = [
    "User passwords stored securely",
    "JWT-based secure authentication for both users and admins",
    "Protected routes and token validation",
    "Profile content visibility based on privacy settings",
    "Admin and users cannot see private posts unless shared",
    "Report and complaint content is kept confidential between reporter and admin",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/2 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="bg-gray-800/95 border border-gray-700 rounded-3xl p-12 shadow-2xl backdrop-blur-md">
            <div className="mb-8">
              <div className="inline-flex p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl shadow-2xl mb-6">
                <Globe className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-6xl font-bold text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text mb-4 animate-pulse">
                MeetX
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full mb-6"></div>
            </div>
            <p className="text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
              MeetX is a modern social media platform built using the{" "}
              <span className="text-cyan-400 font-semibold">MERN</span>{" "}
              (MongoDB, Express, React, Node.js) stack, designed to deliver a
              seamless and interactive user experience. It supports both regular
              users and administrators with robust features for communication,
              content sharing, user management, moderation, and security.
            </p>
          </div>
        </div>

        {/* User Features Section */}
        <div className="mb-16">
          <div className="bg-gray-800/95 border border-gray-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                  User Features
                </h2>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group bg-gray-700/50 border border-gray-600 rounded-2xl p-6 hover:bg-gray-600/50 hover:border-cyan-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "fadeInUp 0.6s ease-out forwards",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 bg-gradient-to-r ${feature.color} rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-100 group-hover:text-cyan-400 transition-colors duration-300 mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className="mb-16">
          <div className="bg-gray-800/95 border border-gray-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text">
                  Privacy & Security
                </h2>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {privacyFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl hover:bg-green-500/20 transition-all duration-300"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animation: "fadeInUp 0.6s ease-out forwards",
                  }}
                >
                  <div className="p-2 bg-green-500/20 border border-green-500/30 rounded-xl flex-shrink-0">
                    <Shield className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-green-200 leading-relaxed">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Features Section */}
        <div className="mb-16">
          <div className="bg-gray-800/95 border border-gray-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text">
                  Admin Features
                </h2>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {adminFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group bg-gray-700/50 border border-gray-600 rounded-2xl p-6 hover:bg-gray-600/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "fadeInUp 0.6s ease-out forwards",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 bg-gradient-to-r ${feature.color} rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-100 group-hover:text-purple-400 transition-colors duration-300 mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Admin Dashboard Note */}
            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-2xl">
              <div className="flex items-start gap-3">
                <Star className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-yellow-300 mb-2">
                    Admin Dashboard (Upcoming)
                  </h4>
                  <p className="text-yellow-200 leading-relaxed">
                    Planned for visual charts and summaries (e.g., user stats,
                    post counts, complaints overview).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Highlights Section */}
        <div className="mb-16">
          <div className="bg-gray-800/95 border border-gray-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-2xl">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text">
                  Technical Highlights
                </h2>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-teal-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {techHighlights.map((tech, index) => {
                const Icon = tech.icon;
                return (
                  <div
                    key={tech.title}
                    className="group bg-gray-700/50 border border-gray-600 rounded-2xl p-6 hover:bg-gray-600/50 hover:border-cyan-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10 text-center"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "fadeInUp 0.6s ease-out forwards",
                    }}
                  >
                    <div
                      className={`inline-flex p-4 bg-gradient-to-r ${tech.color} rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg mb-4`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-100 group-hover:text-cyan-400 transition-colors duration-300 mb-3">
                      {tech.title}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                      {tech.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-3xl p-12 shadow-2xl backdrop-blur-md">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text mb-4">
                Ready to Connect?
              </h3>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Join MeetX today and experience the future of social media with
                cutting-edge technology and user-centric design.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full animate-bounce">
                <Globe className="w-8 h-8 text-white" />
              </div>
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
}

export default About;
