import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Shield, Users, FileText, Mail, Phone } from 'lucide-react';

function TermsConditions() {
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (sectionId) => {
        setExpandedSection(expandedSection === sectionId ? null : sectionId);
    };

    const sections = [
        {
            id: 'acceptance',
            title: 'Acceptance of Terms',
            icon: <FileText size={16} className="md:w-5 md:h-5" />,
            content: `By accessing and using our social media platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services. These terms constitute a legally binding agreement between you and our platform.`
        },
        {
            id: 'eligibility',
            title: 'User Eligibility',
            icon: <Users size={16} className="md:w-5 md:h-5" />,
            content: `You must be at least 13 years old to use our platform. Users between 13-17 years old must have parental consent. By creating an account, you represent that you meet these age requirements and have the legal capacity to enter into this agreement. We reserve the right to verify your age and request additional documentation if needed.`
        },
        {
            id: 'account',
            title: 'Account Registration & Security',
            icon: <Shield size={16} className="md:w-5 md:h-5" />,
            content: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate, current, and complete information during registration. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.`
        },
        {
            id: 'content',
            title: 'User Content & Conduct',
            icon: <FileText size={16} className="md:w-5 md:h-5" />,
            content: `You retain ownership of content you post, but grant us a worldwide, non-exclusive license to use, display, and distribute your content. You are solely responsible for your content and must ensure it doesn't violate our community guidelines. Prohibited content includes but is not limited to: hate speech, harassment, spam, illegal activities, and copyright infringement.`
        },
        {
            id: 'privacy',
            title: 'Privacy & Data Protection',
            icon: <Shield size={16} className="md:w-5 md:h-5" />,
            content: `Your privacy is important to us. We collect, use, and protect your personal information in accordance with our Privacy Policy. By using our services, you consent to the collection and use of your data as described in our Privacy Policy. We implement appropriate security measures to protect your personal information.`
        },
        {
            id: 'moderation',
            title: 'Content Moderation',
            icon: <Shield size={16} className="md:w-5 md:h-5" />,
            content: `We reserve the right to review, moderate, and remove content that violates our terms or community guidelines. We may suspend or terminate accounts that repeatedly violate our policies. Content moderation decisions are made at our discretion, and we strive to apply our policies fairly and consistently.`
        },
        {
            id: 'intellectual',
            title: 'Intellectual Property',
            icon: <FileText size={16} className="md:w-5 md:h-5" />,
            content: `Our platform and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not use our intellectual property without our express written permission.`
        },
        {
            id: 'termination',
            title: 'Account Termination',
            icon: <Users size={16} className="md:w-5 md:h-5" />,
            content: `You may terminate your account at any time by following the account deletion process in your settings. We reserve the right to suspend or terminate your account for violations of these terms, illegal activities, or at our discretion. Upon termination, your right to use our services ceases immediately.`
        },
        {
            id: 'liability',
            title: 'Limitation of Liability',
            icon: <Shield size={16} className="md:w-5 md:h-5" />,
            content: `Our platform is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability to you for any claims shall not exceed the amount you paid us in the past 12 months.`
        },
        {
            id: 'changes',
            title: 'Changes to Terms',
            icon: <Calendar size={16} className="md:w-5 md:h-5" />,
            content: `We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notifications. Your continued use of our services after changes constitutes acceptance of the new terms. We encourage you to review these terms periodically.`
        }
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Enhanced Mobile-Responsive Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-8 md:py-16 px-3 md:px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                        Terms & Conditions
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 mb-3 md:mb-4 leading-relaxed px-2">
                        Please read these terms carefully before using our platform
                    </p>
                    <div className="flex items-center justify-center text-blue-200 text-xs sm:text-sm md:text-base">
                        <Calendar size={14} className="mr-2 md:w-4 md:h-4" />
                        Last updated: December 2025
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-3 md:px-4 py-6 md:py-12">
                {/* Enhanced Mobile Welcome Section */}
                <div className="bg-gray-800 rounded-lg p-4 md:p-6 lg:p-8 mb-6 md:mb-8">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 md:mb-4 text-blue-400">
                        Welcome to Our Platform
                    </h2>
                    <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-3 md:mb-4">
                        These Terms and Conditions govern your use of our social media platform and services. 
                        By creating an account or using our services, you agree to comply with these terms. 
                        Our platform is designed to connect people, share experiences, and build communities 
                        in a safe and respectful environment.
                    </p>
                    <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                        We are committed to providing a positive user experience while protecting the rights 
                        and safety of all our users. These terms help us maintain a platform that is enjoyable, 
                        secure, and legally compliant for everyone.
                    </p>
                </div>

                {/* Enhanced Mobile Sections */}
                <div className="space-y-3 md:space-y-4">
                    {sections.map((section, index) => (
                        <div key={section.id} className="bg-gray-800 rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full px-4 md:px-6 py-3 md:py-4 text-left flex items-center justify-between hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center space-x-2 md:space-x-3">
                                    <div className="text-blue-400">
                                        {section.icon}
                                    </div>
                                    <h3 className="text-sm sm:text-base md:text-lg font-semibold leading-tight">
                                        {index + 1}. {section.title}
                                    </h3>
                                </div>
                                <div className="text-gray-400 flex-shrink-0 ml-2">
                                    {expandedSection === section.id ? 
                                        <ChevronUp size={18} className="md:w-5 md:h-5" /> : 
                                        <ChevronDown size={18} className="md:w-5 md:h-5" />
                                    }
                                </div>
                            </button>
                            
                            {expandedSection === section.id && (
                                <div className="px-4 md:px-6 pb-4 md:pb-6">
                                    <div className="border-l-4 border-blue-500 pl-3 md:pl-4">
                                        <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
                                            {section.content}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Enhanced Mobile Key Points Section */}
                <div className="mt-8 md:mt-12 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-4 md:p-6 lg:p-8">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">
                        Key Points to Remember
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="flex items-start space-x-3">
                            <div className="bg-blue-500 rounded-full p-1.5 md:p-2 flex-shrink-0">
                                <Users size={14} className="md:w-4 md:h-4" />
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Respectful Community</h4>
                                <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                                    Treat all users with respect and kindness. Harassment and hate speech are not tolerated.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                            <div className="bg-green-500 rounded-full p-1.5 md:p-2 flex-shrink-0">
                                <Shield size={14} className="md:w-4 md:h-4" />
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Your Privacy Matters</h4>
                                <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                                    We protect your personal information and give you control over your data.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                            <div className="bg-purple-500 rounded-full p-1.5 md:p-2 flex-shrink-0">
                                <FileText size={14} className="md:w-4 md:h-4" />
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Content Ownership</h4>
                                <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                                    You own your content, but share usage rights with us to provide our services.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                            <div className="bg-orange-500 rounded-full p-1.5 md:p-2 flex-shrink-0">
                                <Calendar size={14} className="md:w-4 md:h-4" />
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Stay Updated</h4>
                                <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                                    We'll notify you of important changes to these terms and policies.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Mobile Contact Section */}
                <div className="mt-8 md:mt-12 bg-gray-800 rounded-lg p-4 md:p-6 lg:p-8">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">
                        Questions About These Terms?
                    </h3>
                    <div className="text-center space-y-3 md:space-y-4">
                        <p className="text-sm md:text-base text-gray-300 mb-4 md:mb-6 leading-relaxed px-2">
                            If you have any questions about these Terms and Conditions, please don't hesitate to contact us.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8">
                            <div className="flex items-center space-x-2 text-blue-400">
                                <Mail size={16} className="md:w-[18px] md:h-[18px]" />
                                <span className="text-sm md:text-base break-all">ommprakashsahu.work@gmail.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Mobile Footer */}
                <div className="mt-8 md:mt-12 text-center text-gray-400 text-xs md:text-sm">
                    <p className="leading-relaxed">
                        By continuing to use our platform, you acknowledge that you have read and understood these Terms and Conditions.
                    </p>
                    <p className="mt-2 leading-relaxed">
                        Thank you for being part of our community!
                    </p>
                </div>
            </div>
        </div>
    );
}

export default TermsConditions;
