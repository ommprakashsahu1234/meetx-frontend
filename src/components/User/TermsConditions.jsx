import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Shield,
  Users,
  FileText,
  Mail,
} from "lucide-react";

function TermsConditions() {
  const [expandedSection, setExpandedSection] = useState(null);
  const neonStyle = {
    filter: "drop-shadow(0 0 1.5px #099) drop-shadow(0 0 3px #099)",
  };

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: <FileText size={16} className="md:w-5 md:h-5" />,
      content: `By accessing and using our social media platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services. These terms constitute a legally binding agreement between you and our platform.`,
    },
    {
      id: "eligibility",
      title: "User Eligibility",
      icon: <Users size={16} className="md:w-5 md:h-5" />,
      content: `You must be at least 13 years old to use our platform. Users between 13-17 years old must have parental consent. By creating an account, you represent that you meet these age requirements and have the legal capacity to enter into this agreement. We reserve the right to verify your age and request additional documentation if needed.`,
    },
    {
      id: "account",
      title: "Account Registration & Security",
      icon: <Shield size={16} className="md:w-5 md:h-5" />,
      content: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate, current, and complete information during registration. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.`,
    },
    {
      id: "content",
      title: "User Content & Conduct",
      icon: <FileText size={16} className="md:w-5 md:h-5" />,
      content: `You retain ownership of content you post, but grant us a worldwide, non-exclusive license to use, display, and distribute your content. You are solely responsible for your content and must ensure it doesn't violate our community guidelines. Prohibited content includes but is not limited to: hate speech, harassment, spam, illegal activities, and copyright infringement.`,
    },
    {
      id: "privacy",
      title: "Privacy & Data Protection",
      icon: <Shield size={16} className="md:w-5 md:h-5" />,
      content: `Your privacy is important to us. We collect, use, and protect your personal information in accordance with our Privacy Policy. By using our services, you consent to the collection and use of your data as described in our Privacy Policy. We implement appropriate security measures to protect your personal information.`,
    },
    {
      id: "moderation",
      title: "Content Moderation",
      icon: <Shield size={16} className="md:w-5 md:h-5" />,
      content: `We reserve the right to review, moderate, and remove content that violates our terms or community guidelines. We may suspend or terminate accounts that repeatedly violate our policies. Content moderation decisions are made at our discretion, and we strive to apply our policies fairly and consistently.`,
    },
    {
      id: "intellectual",
      title: "Intellectual Property",
      icon: <FileText size={16} className="md:w-5 md:h-5" />,
      content: `Our platform and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not use our intellectual property without our express written permission.`,
    },
    {
      id: "termination",
      title: "Account Termination",
      icon: <Users size={16} className="md:w-5 md:h-5" />,
      content: `You may terminate your account at any time by following the account deletion process in your settings. We reserve the right to suspend or terminate your account for violations of these terms, illegal activities, or at our discretion. Upon termination, your right to use our services ceases immediately.`,
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      icon: <Shield size={16} className="md:w-5 md:h-5" />,
      content: `Our platform is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability to you for any claims shall not exceed the amount you paid us in the past 12 months.`,
    },
    {
      id: "changes",
      title: "Changes to Terms",
      icon: <Calendar size={16} className="md:w-5 md:h-5" />,
      content: `We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notifications. Your continued use of our services after changes constitutes acceptance of the new terms. We encourage you to review these terms periodically.`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#172133] text-[#0bb]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0bb] to-[#145279] py-10 px-4 shadow-subtleNeonBtn text-center">
        <h1 className="text-3xl md:text-5xl font-bold">Terms & Conditions</h1>
        <p className="text-[#88bbdd] mt-3 text-lg max-w-2xl mx-auto">
          Please read these terms carefully before using our platform
        </p>
        <div className="mt-2 flex items-center justify-center gap-2 text-[#88bbdd] text-sm">
          <Calendar size={16} style={neonStyle} /> Last updated: December 2025
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Intro */}
        <section className="bg-[#1a2b46] p-6 rounded-3xl border border-[#1f2a47] shadow-subtleNeon">
          <h2 className="text-2xl font-bold mb-4">Welcome to Our Platform</h2>
          <p className="text-[#88bbdd] leading-relaxed">
            These Terms and Conditions govern your use of our social media
            platform...
          </p>
        </section>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="bg-[#1a2b46] rounded-2xl border border-[#1f2a47] shadow-subtleNeon overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-[#273b62] transition"
              >
                <div className="flex items-center gap-3">
                  {section.icon}
                  <span className="font-semibold">
                    {index + 1}. {section.title}
                  </span>
                </div>
                {expandedSection === section.id ? (
                  <ChevronUp size={20} className="text-[#88bbdd]" />
                ) : (
                  <ChevronDown size={20} className="text-[#88bbdd]" />
                )}
              </button>
              {expandedSection === section.id && (
                <div className="px-6 pb-4 border-t border-[#1f2a47]">
                  <p className="text-[#88bbdd] leading-relaxed">
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Key Points */}
        <section className="bg-gradient-to-r from-[#0bb]/10 to-[#145279]/10 p-6 rounded-3xl border border-[#0bb]/30 shadow-subtleNeon">
          <h3 className="text-center text-2xl font-bold mb-6">
            Key Points to Remember
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <Users size={20} style={neonStyle} />{" "}
              <span className="text-[#88bbdd]">Respect all members.</span>
            </li>
            <li className="flex gap-3">
              <Shield size={20} style={neonStyle} />{" "}
              <span className="text-[#88bbdd]">We protect your privacy.</span>
            </li>
          </ul>
        </section>

        {/* Contact */}
        <section className="bg-[#1a2b46] p-6 rounded-3xl border border-[#1f2a47] shadow-subtleNeon text-center">
          <h3 className="text-xl font-semibold mb-4">
            Questions About These Terms?
          </h3>
          <p className="text-[#88bbdd] mb-4">Contact us at:</p>
          <div className="inline-flex items-center gap-2 text-[#0bb]">
            <Mail size={18} style={neonStyle} /> ommprakashsahu.work@gmail.com
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-[#5599bb] text-sm pt-6 border-t border-[#1f2a47]">
          <p>
            By using our platform, you acknowledge reading and understanding
            these Terms.
          </p>
          <p>Thank you for being part of our community!</p>
        </footer>
      </div>

      {/* Shadows */}
      <style>{`
        .shadow-subtleNeon { box-shadow: 0 0 3px #0bb6, 0 0 8px #0bb4a; }
        .shadow-subtleNeonBtn { box-shadow: 0 0 4px #0bb8, 0 0 10px #0bb5a; }
      `}</style>
    </div>
  );
}

export default TermsConditions;
