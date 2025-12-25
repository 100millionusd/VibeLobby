import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import type { LegalPage } from './LegalModal';

interface CookieBannerProps {
  onOpenLegal?: (page: LegalPage) => void;
}

const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenLegal }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('vibe_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('vibe_cookie_consent', 'full');
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem('vibe_cookie_consent', 'essential');
    setIsVisible(false);
  };

  const handleManage = () => {
    // For now, this acts as opening the Cookie Policy since full granular control isn't built yet
    if (onOpenLegal) {
      onOpenLegal('cookies');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] animate-in slide-in-from-bottom-10 duration-500">
      <div className="max-w-xl mx-auto bg-gray-900/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-2xl border border-gray-700 flex flex-col gap-4">

        {/* Header & Content */}
        <div className="flex items-start gap-4">
          <div className="bg-gray-800 p-2.5 rounded-full shrink-0">
            <Cookie size={20} className="text-brand-400" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-bold text-white text-base">Privacy & Vibes</span>
            </div>

            <p className="text-sm leading-relaxed text-gray-300">
              We use cookies and similar technologies (including local storage) to run the booking flow, keep you logged in, prevent fraud, and maintain access to your verified booking (“Digital Key”). These are strictly necessary for the service you request.
            </p>

            {isExpanded && (
              <p className="text-sm leading-relaxed text-gray-300 animate-in fade-in slide-in-from-top-2 duration-300">
                With your permission, we also use optional cookies for analytics, advertising measurement, experimentation, and customer support chat (e.g., Google Analytics, Google Ads, VWO, and Crisp via Web3Auth).
              </p>
            )}

            {!isExpanded && (
              <button onClick={() => setIsExpanded(true)} className="text-xs text-gray-400 underline hover:text-white transition-colors">
                Read more
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleRejectNonEssential}
            className="px-4 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 text-sm font-medium transition-all"
          >
            Reject non-essential
          </button>

          <button
            onClick={handleManage}
            className="px-4 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 text-sm font-medium transition-all"
          >
            Manage settings
          </button>

          <button
            onClick={handleAcceptAll}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-sm shadow-lg transition-all transform active:scale-95"
          >
            Accept All
          </button>
        </div>

        {/* Footer Links */}
        <div className="text-center sm:text-left text-[11px] text-gray-500 mt-1 flex gap-3 justify-center sm:justify-start">
          <button onClick={() => onOpenLegal?.('cookies')} className="hover:text-gray-300 transition-colors">Cookie Policy</button>
          <span>•</span>
          <button onClick={() => onOpenLegal?.('privacy')} className="hover:text-gray-300 transition-colors">Privacy Policy</button>
          <span>•</span>
          <button onClick={() => onOpenLegal?.('terms')} className="hover:text-gray-300 transition-colors">Terms</button>
        </div>

      </div>
    </div>
  );
};

export default CookieBanner;