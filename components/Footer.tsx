import React from 'react';
import { LegalPage } from './LegalModal';

interface FooterProps {
  onOpenLegal: (page: LegalPage) => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-12 text-center text-xs text-gray-400">
      <div className="max-w-md mx-auto px-6">
        <p className="mb-3 font-semibold text-gray-500">
          © {new Date().getFullYear()} VibeLobby.
        </p>
        <p className="mb-6 leading-relaxed">
          <strong>Transparency:</strong> VibeLobby utilizes the Duffel API to provide real-time availability and secure direct bookings.
          We act as a curated marketplace connecting travelers with social-first destinations.
        </p>
        <div className="flex justify-center gap-4 opacity-80 mb-4">
          <button onClick={() => onOpenLegal('privacy')} className="hover:text-gray-900 hover:underline">Privacy</button>
          <span className="text-gray-300">•</span>
          <button onClick={() => onOpenLegal('terms')} className="hover:text-gray-900 hover:underline">Terms</button>
          <span className="text-gray-300">•</span>
          <button onClick={() => onOpenLegal('cookies')} className="hover:text-gray-900 hover:underline">Cookies</button>
        </div>

        <div className="mb-6">
          <a href="mailto:support@vibelobby.com" className="text-brand-600 font-medium hover:underline">Contact Support</a>
          <span className="text-xs text-gray-400 ml-4">v2.0 (Duffel Integration)</span>
        </div>

        <p className="text-[10px] uppercase tracking-widest opacity-50">
          Built for the Vibe • Worldwide
        </p>
      </div>
    </footer>
  );
};

export default Footer;