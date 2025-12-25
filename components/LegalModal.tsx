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
        <p><strong>Last Updated:</strong> December 25, 2025</p>
        <p>Welcome to VibeLobby (the “Platform”). These Terms of Service (“Terms”) govern access to and use of the Platform.</p>
        <p>VibeLobby is a product of <strong>Heitaria Swiss AG</strong> (“Heitaria”, “we”, “us”). By accessing or using the Platform, you agree to these Terms.</p>

        <p className="mt-2 text-xs bg-gray-100 p-2 rounded border border-gray-200">
          <strong>Heitaria Swiss AG (VibeLobby)</strong><br />
          Rigistrasse 1<br />
          6374 Buochs<br />
          Switzerland<br />
          <strong>Email:</strong> <a href="mailto:support@vibelobby.com" className="text-brand-600 hover:underline">support@vibelobby.com</a>
        </p>

        <h4 className="font-bold text-gray-900 mt-4">1. Definitions</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>“Booking”:</strong> reservation for travel services made through the Platform.</li>
          <li><strong>“Travel Provider”:</strong> airline, hotel, or service provider delivering the service.</li>
          <li><strong>“Digital Lobby”:</strong> in-app social space associated with a specific stay.</li>
          <li><strong>“Digital Key”:</strong> credential/token used to participate in a Digital Lobby.</li>
        </ul>

        <h4 className="font-bold text-gray-900 mt-4">2. Our Service</h4>
        <p>We operate as an OTA and social platform, facilitating bookings via Duffel and connecting travelers. We are <strong>not</strong> a hotel or tour operator. Travel Providers control the on-site experience and their own terms apply.</p>

        <h4 className="font-bold text-gray-900 mt-4">3. Eligibility and Account</h4>
        <p>You must be 18+ and have legal capacity. You are responsible for account security and providing accurate traveler identity details.</p>

        <h4 className="font-bold text-gray-900 mt-4">4. Bookings, Payments, and Taxes</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Bookings:</strong> You authorize us to share data with Duffel/Providers to complete reservations.</li>
          <li><strong>Payments:</strong> Processed by third-party providers. We don't store full card numbers.</li>
          <li><strong>Traveler Requirements:</strong> You are responsible for passports, visas, and health requirements.</li>
        </ul>

        <h4 className="font-bold text-gray-900 mt-4">5. Cancellations, Changes, and Refunds</h4>
        <p><strong>Provider Policies Control:</strong> Refundability is determined by the rate/Provider. We honor their policies.</p>
        <p>Disputes/Chargebacks may result in account suspension during investigation.</p>

        <h4 className="font-bold text-gray-900 mt-4">6. Social Features & Conduct (The "Vibe")</h4>
        <p>Social features (Lobby Chat, Activity Density) are optional.</p>

        <h5 className="font-bold text-gray-800 mt-2 text-xs uppercase tracking-wide">Community Rules (Zero Tolerance)</h5>
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-xs text-red-800">
          You agree NOT to: harass, bully, post hate speech, solicit illegal services, or share explicit content. Violations result in <strong>immediate ban</strong> and revocation of Digital Keys.
        </div>

        <p className="mt-2">If you enable <strong>Public Mode</strong>, limited profile info (Photo, Vibe Tags) is visible to verify guests in the same lobby.</p>

        <h4 className="font-bold text-gray-900 mt-4">7. User Content</h4>
        <p>You retain ownership of your content but grant us a license to host/display it for platform operation. You must have rights to what you post.</p>

        <h4 className="font-bold text-gray-900 mt-4">8. AI Features</h4>
        <p>AI "Social Forecasts" are informational/predictive only. Do not rely on them for safety-critical decisions.</p>

        <h4 className="font-bold text-gray-900 mt-4">9. Disclaimers & Liability</h4>
        <p>The Platform is provided "as is". Heitaria is not liable for indirect damages or disputes with Travel Providers. Liability is limited to the booking amount paid in the last 12 months (where permitted by law).</p>

        <h4 className="font-bold text-gray-900 mt-4">10. Governing Law</h4>
        <p>Terms are governed by the laws of <strong>Switzerland</strong>. Exclusive venue: Nidwalden, Switzerland.</p>
      </div>
    )
  },
  cookies: {
    title: 'Cookie Policy',
    icon: Cookie,
    content: (
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p><strong>Last Updated:</strong> December 25, 2025</p>
        <p>This Cookie Policy explains how VibeLobby (a product of <strong>Heitaria Swiss AG</strong>) uses cookies and similar technologies (including local storage) on vibelobby.com and in our web application (the “Services”).</p>

        <p className="mt-2 text-xs bg-gray-100 p-2 rounded border border-gray-200">
          <strong>Heitaria Swiss AG (VibeLobby)</strong><br />
          Rigistrasse 1<br />
          6374 Buochs<br />
          Switzerland<br />
          <strong>Email:</strong> <a href="mailto:support@vibelobby.com" className="text-brand-600 hover:underline">support@vibelobby.com</a>
        </p>

        <h4 className="font-bold text-gray-900 mt-4">1. What Are Cookies?</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Cookies:</strong> Small text files stored by your browser.</li>
          <li><strong>Local Storage:</strong> Browser technology to store data (like Digital Keys).</li>
        </ul>

        <h4 className="font-bold text-gray-900 mt-4">2. Why We Use Them</h4>
        <p>To keep services functioning, remember preferences, secure accounts, and prevent fraud.</p>

        <h4 className="font-bold text-gray-900 mt-4">3. Types of Cookies We Use</h4>

        <h5 className="font-bold text-gray-800 mt-2 text-xs uppercase tracking-wide">A. Essential (Strictly Necessary)</h5>
        <p>Required for operation. Examples:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>Authentication (staying logged in).</li>
          <li>Storing <strong>Digital Keys</strong> so you don't lose lobby access on refresh.</li>
          <li>Security features (CSRF protection).</li>
        </ul>
        <div className="bg-yellow-50 border border-yellow-200 p-2 rounded mt-2 text-xs">
          <strong>Note:</strong> Clearing these removes access to active lobbies until you re-verify.
        </div>

        <h5 className="font-bold text-gray-800 mt-2 text-xs uppercase tracking-wide">B. Preference (Functional)</h5>
        <p>Remember choices like last searched city or selected Vibe Tags.</p>

        <h5 className="font-bold text-gray-800 mt-2 text-xs uppercase tracking-wide">C. Analytics (Optional)</h5>
        <p>Used to understand usage. Where required by law, we request consent.</p>

        <h5 className="font-bold text-gray-800 mt-2 text-xs uppercase tracking-wide">D. Marketing (Optional)</h5>
        <p>Used to measure campaigns. Where required, we request consent.</p>

        <h5 className="font-bold text-gray-800 mt-2 text-xs uppercase tracking-wide">E. Support / Customer Messaging (Optional)</h5>
        <p>Used to maintain chat sessions (e.g., live chat).</p>

        <h5 className="font-bold text-gray-800 mt-4 text-xs uppercase tracking-wide">Cookie List (Observed)</h5>
        <div className="overflow-x-auto mt-2 border border-gray-200 rounded-lg">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-gray-50 font-bold text-gray-700">
              <tr>
                <th className="p-2 border-b">Category</th>
                <th className="p-2 border-b">Cookie Name</th>
                <th className="p-2 border-b">Provider</th>
                <th className="p-2 border-b">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-2">Analytics</td>
                <td className="p-2 font-mono text-[10px]">_ga</td>
                <td className="p-2">Google (via Web3Auth)</td>
                <td className="p-2">Users / Analytics ID</td>
              </tr>
              <tr>
                <td className="p-2">Analytics</td>
                <td className="p-2 font-mono text-[10px]">_ga_DY71GQK057</td>
                <td className="p-2">Google (GA4)</td>
                <td className="p-2">Session state</td>
              </tr>
              <tr>
                <td className="p-2">Marketing</td>
                <td className="p-2 font-mono text-[10px]">_gcl_au</td>
                <td className="p-2">Google Ads</td>
                <td className="p-2">Ad attribution</td>
              </tr>
              <tr>
                <td className="p-2">Experimentation</td>
                <td className="p-2 font-mono text-[10px]">_vwo_uuid_v2</td>
                <td className="p-2">VWO</td>
                <td className="p-2">A/B Testing</td>
              </tr>
              <tr>
                <td className="p-2">Support</td>
                <td className="p-2 font-mono text-[10px]">crisp-client...</td>
                <td className="p-2">Crisp</td>
                <td className="p-2">Chat session</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="font-bold text-gray-900 mt-4">4. Managing Cookies</h4>
        <p>You can block/delete cookies in browser settings. Clearing local storage will log you out and remove Digital Keys.</p>
        <p>Where required (EEA/UK), we provide in-app consent controls.</p>

        <h4 className="font-bold text-gray-900 mt-4">5. Updates</h4>
        <p>We may update this policy. Last updated date is at the top.</p>

        <h4 className="font-bold text-gray-900 mt-4">Contact</h4>
        <p><strong>Heitaria Swiss AG</strong><br />Email: <a href="mailto:support@vibelobby.com" className="text-brand-600 hover:underline">support@vibelobby.com</a></p>
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