import React from 'react';
import { X, Shield, FileText, Cookie } from 'lucide-react';

export type LegalPage = 'privacy' | 'terms' | 'cookies';

interface LegalModalProps {
  page: LegalPage;
  onClose: () => void;
}

const CONTENT: Record<LegalPage, { title: string; icon: React.ElementType; content: React.ReactNode }> = {
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    content: (
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p><strong>Effective Date:</strong> October 24, 2023</p>
        <p>At VibeLobby, we prioritize the protection of your data. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our social-first booking platform.</p>
        
        <h4 className="font-bold text-gray-900 mt-4">1. Information We Collect</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Identity Data:</strong> Name and email address when you make a booking.</li>
          <li><strong>Location Data:</strong> GPS coordinates (latitude/longitude) ONLY when you explicitly use the "Verify Location" feature to join a lobby. We do not track your location in the background.</li>
          <li><strong>Booking Data:</strong> Hotel details, dates, and payment confirmation references provided via our partners (Duffel).</li>
          <li><strong>Usage Data:</strong> Search queries and "vibe" preferences to improve our AI recommendations.</li>
        </ul>

        <h4 className="font-bold text-gray-900 mt-4">2. How We Use Your Data</h4>
        <p>We use your data to facilitate hotel bookings, verify your physical presence for secure chat access, and generate AI-powered social forecasts using Google Gemini.</p>

        <h4 className="font-bold text-gray-900 mt-4">3. Third-Party Sharing</h4>
        <p>We share necessary transaction data with <strong>Duffel</strong> (our booking engine provider) to process your reservation. We do not sell your personal data to advertisers.</p>
      </div>
    )
  },
  terms: {
    title: 'Terms of Service',
    icon: FileText,
    content: (
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p><strong>Last Updated:</strong> October 24, 2023</p>
        <p>Welcome to VibeLobby. By accessing our platform, you agree to these Terms of Service.</p>

        <h4 className="font-bold text-gray-900 mt-4">1. Our Service</h4>
        <p>VibeLobby acts as an Online Travel Agency (OTA) and social platform. We facilitate bookings through third-party providers. We are not a hotel operator and are not responsible for the on-site experience provided by the accommodation.</p>

        <h4 className="font-bold text-gray-900 mt-4">2. User Conduct</h4>
        <p>The "Lobby Chat" feature is a privilege. We operate a zero-tolerance policy for harassment, hate speech, or illegal solicitation. Violation of these rules will result in an immediate ban and revocation of your Digital Key.</p>

        <h4 className="font-bold text-gray-900 mt-4">3. Bookings & Cancellations</h4>
        <p>All bookings are processed securely via the Duffel API. Cancellation policies (Refundable vs. Non-Refundable) are specific to the rate selected at checkout. VibeLobby honors the policy dictated by the hotel provider.</p>

        <h4 className="font-bold text-gray-900 mt-4">4. Liability</h4>
        <p>VibeLobby is provided "as is". We make no warranties regarding the accuracy of AI-generated "Social Forecasts" as these are predictive in nature.</p>
      </div>
    )
  },
  cookies: {
    title: 'Cookie Policy',
    icon: Cookie,
    content: (
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p>We use cookies and local storage technologies to enhance your experience.</p>

        <h4 className="font-bold text-gray-900 mt-4">1. Essential Cookies</h4>
        <p>These are necessary for the app to function. For example, we use <code>localStorage</code> to keep you logged in and to store your "Digital Keys" (verified bookings) so you don't lose chat access on page refresh.</p>

        <h4 className="font-bold text-gray-900 mt-4">2. Preference Cookies</h4>
        <p>We store your last searched city and interest tags to provide faster results upon your return.</p>

        <h4 className="font-bold text-gray-900 mt-4">3. Managing Cookies</h4>
        <p>You can clear your browser cache or local storage at any time to reset your session. Note that this will log you out and remove access to active lobbies until you re-verify.</p>
      </div>
    )
  }
};

const LegalModal: React.FC<LegalModalProps> = ({ page, onClose }) => {
  const data = CONTENT[page];
  const Icon = data.icon;

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2 text-brand-600">
            <Icon size={24} />
            <h2 className="font-bold text-xl text-gray-900">{data.title}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
           {data.content}
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <button 
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default LegalModal;