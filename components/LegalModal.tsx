import React from 'react';
import { FileText, Shield, Cookie, X } from 'lucide-react';

export type LegalPage = 'privacy' | 'terms' | 'cookies';

interface LegalModalProps {
  page: LegalPage;
  onClose: () => void;
}

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    content: (
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p><strong>Last Updated:</strong> December 25, 2025</p>
        <p>Your privacy is critical to us. This policy outlines how VibeLobby (a product of <strong>Heitaria Swiss AG</strong>) collects, uses, and protects your data.</p>
        <p><strong>Entity:</strong> Heitaria Swiss AG, Rigistrasse 1, 6374 Buochs, Switzerland.</p>
        <p><strong>Contact:</strong> <a href="mailto:support@vibelobby.com" className="text-brand-600 hover:underline">support@vibelobby.com</a></p>

        <h4 className="font-bold text-gray-900 mt-4">1. Data We Collect</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Identity Data:</strong> Name, email, wallet address (via Web3Auth), and profile photo.</li>
          <li><strong>Booking Data:</strong> Hotel details, dates, and guests (processed via Duffel).</li>
          <li><strong>Usage Data:</strong> Search history, "Vibe Tags" interests, and lobby chat interactions.</li>
        </ul>

        <h4 className="font-bold text-gray-900 mt-4">2. How We Use Your Data</h4>
        <p>We use your data to facilitate bookings, verify your "Digital Key" for lobby access, providing "Social Forecasts" (aggregated/anonymized), and legal compliance.</p>

        <h4 className="font-bold text-gray-900 mt-4">3. Data Sharing</h4>
        <p>We share booking data with <strong>Duffel</strong> (and the respective Travel Provider) to fulfill your reservation. We do <strong>not</strong> sell your personal data to third parties.</p>

        <h4 className="font-bold text-gray-900 mt-4">4. Your Rights (GDPR/Swiss FADP)</h4>
        <p>You have the right to access, correct, delete, or export your data. Contact us at <a href="mailto:support@vibelobby.com" className="text-brand-600 hover:underline">support@vibelobby.com</a> to exercise these rights.</p>
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
          <li><strong>Cookies:</strong> Small text files stored by your browser that allow us to remember your session and settings.</li>
          <li><strong>Local Storage:</strong> Browser technology used to store data locally on your device (such as your "Digital Key" for secure access).</li>
        </ul>

        <h4 className="font-bold text-gray-900 mt-4">2. Why We Use Them</h4>
        <p>We use these technologies to keep our Services functioning, remember your preferences, secure your account, prevent fraud, and maintain your verified booking status.</p>

        <h4 className="font-bold text-gray-900 mt-4">3. Types of Cookies We Use</h4>

        <h5 className="font-bold text-gray-800 mt-2 text-xs uppercase tracking-wide">A. Essential (Strictly Necessary)</h5>
        <p>These are required for the operation and security of the Services. You cannot opt out of these, as the application cannot function securely without them.</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li><strong>Authentication:</strong> Keeps you logged in during your session.</li>
          <li><strong>Wallet Security (Web3Auth):</strong> We use third-party infrastructure (Web3Auth/OpenLogin) to securely reconstruct your private key and manage the "Digital Key" handshake. These cookies are strictly limited to security, session management, and cryptography; they are not used for advertising or tracking.</li>
          <li><strong>Fraud Prevention:</strong> Detects abnormal login attempts to protect your assets.</li>
          <li><strong>CSRF Protection:</strong> Prevents cross-site forgery attacks.</li>
        </ul>
        <div className="bg-yellow-50 border border-yellow-200 p-2 rounded mt-2 text-xs">
          <strong>Note:</strong> Clearing these cookies or local storage will log you out and remove access to active lobbies until you re-verify.
        </div>

        <h5 className="font-bold text-gray-800 mt-2 text-xs uppercase tracking-wide">B. Preference (Functional)</h5>
        <p>These remember your choices to improve your experience, such as your last searched city or selected Vibe Tags.</p>

        <h5 className="font-bold text-gray-800 mt-2 text-xs uppercase tracking-wide">C. Analytics (Optional)</h5>
        <p>Used to understand how visitors interact with our website (e.g., page visit counts). These are only active if you grant consent.</p>

        <h5 className="font-bold text-gray-800 mt-2 text-xs uppercase tracking-wide">D. Marketing (Optional)</h5>
        <p>Used to measure advertising campaigns. These are only active if you grant consent.</p>

        <h5 className="font-bold text-gray-800 mt-2 text-xs uppercase tracking-wide">E. Support (Optional)</h5>
        <p>Used to maintain chat sessions (e.g., customer support messengers).</p>

        <h5 className="font-bold text-gray-800 mt-4 text-xs uppercase tracking-wide">Cookie List (Detailed)</h5>
        <div className="overflow-x-auto mt-2 border border-gray-200 rounded-lg">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-gray-50 font-bold text-gray-700">
              <tr>
                <th className="p-2 border-b">Category</th>
                <th className="p-2 border-b">Cookie Name / Domain</th>
                <th className="p-2 border-b">Provider</th>
                <th className="p-2 border-b">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-2">Essential</td>
                <td className="p-2 font-mono text-[10px]">openlogin-session, torus-works</td>
                <td className="p-2">Web3Auth / OpenLogin</td>
                <td className="p-2">Security: Reconstructs the private key and manages the secure login handshake.</td>
              </tr>
              <tr>
                <td className="p-2">Essential</td>
                <td className="p-2 font-mono text-[10px]">connect.sid</td>
                <td className="p-2">VibeLobby (Server)</td>
                <td className="p-2">Session: Maintains your verified login state on our servers.</td>
              </tr>
              <tr>
                <td className="p-2">Analytics</td>
                <td className="p-2 font-mono text-[10px]">_ga, _ga_*</td>
                <td className="p-2">Google Analytics</td>
                <td className="p-2">Stats: Distinct from Web3Auth, these track generic site usage if accepted.</td>
              </tr>
              <tr>
                <td className="p-2">Marketing</td>
                <td className="p-2 font-mono text-[10px]">_gcl_au</td>
                <td className="p-2">Google Ads</td>
                <td className="p-2">Ads: Ad attribution and conversion tracking if accepted.</td>
              </tr>
              <tr>
                <td className="p-2">Support</td>
                <td className="p-2 font-mono text-[10px]">crisp-client...</td>
                <td className="p-2">Crisp</td>
                <td className="p-2">Chat: Maintains your live chat history and session.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-2 text-xs text-gray-500 italic">
          <strong>Privacy Note:</strong> We have configured our authentication provider (Web3Auth) to disable internal logging and experimentation cookies. Security cookies from *.web3auth.io or *.openlogin.com are used strictly for identity verification.
        </p>

        <h4 className="font-bold text-gray-900 mt-4">4. Managing Cookies</h4>
        <p>You can block or delete cookies in your browser settings. However, please note that clearing Local Storage or blocking Essential cookies will log you out and remove your "Digital Keys," requiring you to re-login to access your lobbies.</p>
        <p>Where required by law (EEA/UK/Switzerland), we provide in-app controls ("Cookie Settings") allowing you to reject non-essential categories.</p>

        <h4 className="font-bold text-gray-900 mt-4">5. Updates</h4>
        <p>We may update this policy to reflect changes in technology or legislation. The effective date is stated at the top of this page.</p>

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
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto no-scrollbar">
          {data.content}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default LegalModal;