import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consented = localStorage.getItem('vibe_cookie_consent');
    if (!consented) {
      // Small delay for better UX on entry
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('vibe_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] animate-in slide-in-from-bottom-10 duration-500">
      <div className="max-w-md mx-auto bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-gray-700 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="bg-gray-800 p-2 rounded-full shrink-0">
            <Cookie size={18} className="text-brand-400" />
          </div>
          <div className="text-xs leading-relaxed text-gray-200">
            <span className="font-bold text-white block mb-0.5">Privacy & Vibes</span>
            We use cookies to personalize your search and ensure the best travel deals.
            By continuing, you agree to our privacy policy.
          </div>
        </div>

        <div className="flex gap-2 w-full pl-11">
          <button
            onClick={handleAccept}
            className="flex-1 bg-white text-gray-900 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors shadow-sm"
          >
            Accept All
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-4 py-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors text-xs font-medium"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;