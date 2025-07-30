import React, { useState } from "react";
import {
  Search,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Headphones,
} from "lucide-react";
import issues from "./Issues.json";
import { useNavigate } from "react-router-dom";

function Supports() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const filteredIssues = issues.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const handleContactSubmit = (e) => {
    navigate("/contact");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Enhanced Mobile-Responsive Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-8 md:py-16 px-3 md:px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-4 md:mb-6">
            <Headphones className="mx-auto mb-3 md:mb-4 text-white" size={48} />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight">
            Support & Help Center
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-blue-100 mb-4 md:mb-6 max-w-2xl mx-auto leading-relaxed px-2">
            Find answers to common questions or get in touch with our support
            team. We're here to help you have the best experience possible!
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Enhanced Mobile Search Bar */}
        <div className="mb-6 md:mb-8">
          <div className="relative">
            <Search
              className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-lg"
            />
          </div>
          {searchTerm && (
            <p className="mt-2 text-xs md:text-sm text-gray-400 px-1">
              Searching for "{searchTerm}" - {filteredIssues.length} results
              found
            </p>
          )}
        </div>

        {/* Enhanced Mobile FAQ Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 md:mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-400">
                Find quick answers to the most common questions
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">
                {filteredIssues.length}
              </div>
              <div className="text-xs md:text-sm text-gray-400">Articles</div>
            </div>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="text-center py-12 md:py-16">
              <AlertCircle className="mx-auto mb-4 md:mb-6 text-gray-400" size={48} />
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 md:mb-4">No results found</h3>
              <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-6 max-w-md mx-auto px-4">
                We couldn't find any articles matching your search. Try using
                different keywords or browse all articles.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 md:px-6 md:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium text-sm md:text-base"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {filteredIssues.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg"
                >
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="w-full px-4 md:px-6 py-4 md:py-5 text-left flex items-center justify-between hover:bg-gray-750 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3 md:gap-4 flex-1">
                      <div className="bg-blue-600 rounded-full p-1.5 md:p-2 mt-0.5 md:mt-1 flex-shrink-0">
                        <HelpCircle size={14} className="md:w-4 md:h-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 pr-3 md:pr-4 leading-tight">
                          {index + 1}. {item.question}
                        </h3>
                        {!expandedItems.has(index) && (
                          <p className="text-xs sm:text-sm md:text-sm text-gray-400 line-clamp-2 leading-relaxed">
                            {item.answer
                              .replace(/<[^>]*>/g, "")
                              .substring(0, 80)}
                            ...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-400 flex-shrink-0 ml-3 md:ml-4">
                      {expandedItems.has(index) ? (
                        <ChevronUp size={20} className="md:w-6 md:h-6" />
                      ) : (
                        <ChevronDown size={20} className="md:w-6 md:h-6" />
                      )}
                    </div>
                  </button>

                  {expandedItems.has(index) && (
                    <div className="px-4 md:px-6 pb-4 md:pb-6">
                      <div className="border-l-4 border-blue-500 pl-4 md:pl-6 bg-gray-750 rounded-r-lg p-3 md:p-4 ml-8 md:ml-12">
                        {item.answer.includes("<a") ? (
                          <div
                            className="text-gray-300 leading-relaxed text-sm md:text-lg"
                            dangerouslySetInnerHTML={{ __html: item.answer }}
                          />
                        ) : (
                          <p className="text-gray-300 leading-relaxed text-sm md:text-lg">
                            {item.answer}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Mobile Contact Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 md:p-8 text-center mb-6 md:mb-8">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 md:mb-4">Still Need Help?</h3>
          <p className="text-sm md:text-base text-gray-300 mb-4 md:mb-6 max-w-2xl mx-auto leading-relaxed px-2">
            Can't find what you're looking for? Our support team is standing by
            to help you with any questions or issues you might have.
          </p>
          <button
            onClick={() => handleContactSubmit()}
            className="px-6 py-2.5 md:px-8 md:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-sm md:text-base"
          >
            Contact Support Team
          </button>
        </div>
      </div>
    </div>
  );
}

export default Supports;
