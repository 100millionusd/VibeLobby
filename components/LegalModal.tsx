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
        <p><strong>Last Updated:</strong> December 25, 2025</p>

        <h4 className="font-bold text-gray-900 mt-4">1. Introduction</h4>
        <p>VibeLobby is a product of <strong>Heitaria Swiss AG</strong> (the “Company”, “we”, “us”). We value privacy and aim to be transparent about how personal information is collected, used, shared, and retained when using VibeLobby to book travel and connect with others. By using VibeLobby, you acknowledge the practices described in this policy.</p>

        <h4 className="font-bold text-gray-900 mt-4">2. Who We Are (Controller)</h4>
        <p>VibeLobby is a product of <strong>Heitaria Swiss AG</strong> ("Heitaria"). Heitaria is the <strong>data controller</strong> for personal information processed under this policy, except where a third party acts as an independent controller (for example, airlines/hotels processing guest data for their own compliance obligations).</p>
        <p className="mt-2 text-xs bg-gray-100 p-2 rounded border border-gray-200">
          <strong>Heitaria Swiss AG</strong><br />
          Rigistrasse 1<br />
          6374 Buochs<br />
          Switzerland<br />
          <strong>Email:</strong> <a href="mailto:support@vibelobby.com" className="text-brand-600 hover:underline">support@vibelobby.com</a>
        </p>

        <h4 className="font-bold text-gray-900 mt-4">3. Information We Collect</h4>

        <h5 className="font-bold text-gray-800 mt-2 text-xs uppercase tracking-wide">A. Transactional Data (the “Booking”)</h5>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li><strong>Identity and contact details:</strong> full legal name, email, phone number.</li>
          <li><strong>Payment details:</strong> processed by a payment provider. <strong>We do not store full card numbers</strong>. We may store payment tokens and limited payment metadata (for example, last four digits, card brand, billing country) where provided by the payment provider.</li>
          <li><strong>Travel document details (when required):</strong> passport/ID details and other traveler information required by airlines, hotels, or legal regulations.</li>
        </ul>

        <h5 className="font-bold text-gray-800 mt-2 text-xs uppercase tracking-wide">B. Social & Vibe Data (the “Experience”)</h5>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li><strong>Vibe Tags and preferences:</strong> interests selected (for example, “Techno”, “Startups”, “Yoga”).</li>
          <li><strong>Approximate geolocation:</strong> used for Activity Density features during active check-in dates.</li>
          <li><strong>Chat content:</strong> messages and content sent through Lobby Chat.</li>
          <li><strong>Profile information (optional):</strong> profile photo and any optional bio/handle that is added.</li>
        </ul>

        <h5 className="font-bold text-gray-800 mt-2 text-xs uppercase tracking-wide">C. Technical and Usage Data</h5>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li><strong>Device and app data:</strong> device type, operating system, app version, browser type.</li>
          <li><strong>Log and analytics data:</strong> IP address, approximate location inferred from IP, timestamps, pages/screens viewed, referral/utm data, and interactions.</li>
          <li><strong>Cookies:</strong> for authentication, session management, and analytics (see Section 10).</li>
        </ul>

        <h4 className="font-bold text-gray-900 mt-4">4. How We Use Information</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Booking Fulfillment:</strong> Create, manage, and share required data with Duffel and travel providers. Provide customer support.</li>
          <li><strong>Social Features:</strong> Calculate compatibility, generate density heatmaps (aggregated), and enable Lobby Chat.</li>
          <li><strong>Safety:</strong> Enforce community rules and Zero-Tolerance policies.</li>
          <li><strong>Operations:</strong> Debugging, fraud prevention, and performance monitoring.</li>
          <li><strong>Legal:</strong> Tax, accounting, audits, and regulatory compliance.</li>
        </ul>

        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mt-2 text-xs">
          <strong>Public Mode Note:</strong> If enabled during a stay, your profile photo and selected Vibe Tags may be shown to other verified guests in the same Digital Lobby. Heatmaps are aggregated and anonymized by default.
        </div>


        <h4 className="font-bold text-gray-900 mt-4">5. Legal Bases (EEA/UK)</h4>
        <p>Where GDPR applies, processing is based on <strong>Contract</strong> (bookings), <strong>Legitimate Interests</strong> (security/fraud), <strong>Consent</strong> (social features), and <strong>Legal Obligation</strong>.</p>

        <h4 className="font-bold text-gray-900 mt-4">6. Data Retention</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Booking records:</strong> 7 years (tax/legal).</li>
          <li><strong>Chat logs:</strong> 30 days post-checkout, then deleted/anonymized.</li>
          <li><strong>Vibe profile:</strong> Retained while account is active.</li>
        </ul>

        <h4 className="font-bold text-gray-900 mt-4">7. Your Rights</h4>
        <p>Depending on your location (GDPR/CCPA), you may have rights to Access, Correction, Deletion, and Portability of your data. You can control social visibility via "Ghost Mode" settings.</p>

        <h4 className="font-bold text-gray-900 mt-4">8. Children using VibeLobby</h4>
        <p>VibeLobby is not intended for children under 13. We do not knowingly create accounts for children.</p>

        <h4 className="font-bold text-gray-900 mt-4">Contact</h4>
        <p><strong>Heitaria Swiss AG</strong><br />Email: <a href="mailto:support@vibelobby.com" className="text-brand-600 hover:underline">support@vibelobby.com</a></p>
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