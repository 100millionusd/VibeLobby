import React, { useEffect, useState } from 'react';
import { Bell, X, MessageCircle, UserPlus } from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'message' | 'join';
  title: string;
  text: string;
}

interface NotificationToastProps {
  notification: NotificationItem | null;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification && !isVisible) return null;

  return (
    <div 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-sm transition-all duration-300 transform
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}
      `}
    >
      <div className="bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-gray-700 flex items-start gap-3">
        <div className={`mt-1 p-2 rounded-full ${notification?.type === 'join' ? 'bg-brand-500' : 'bg-blue-500'}`}>
          {notification?.type === 'join' ? <UserPlus size={16} /> : <MessageCircle size={16} />}
        </div>
        
        <div className="flex-1">
          <h4 className="font-bold text-sm">{notification?.title}</h4>
          <p className="text-xs text-gray-300 mt-0.5">{notification?.text}</p>
        </div>

        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;