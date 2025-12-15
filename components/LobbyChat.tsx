import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, ChevronLeft, MoreVertical, User as UserIcon } from 'lucide-react';
import { ChatMessage, ScoredHotel, User } from '../types';
import { generateLobbyIcebreaker } from '../services/geminiService';
import { USERS } from '../services/mockData';
import { NotificationItem } from './NotificationToast';

interface LobbyChatProps {
  hotel: ScoredHotel;
  interest: string;
  onClose: () => void;
  onNotify: (notification: NotificationItem) => void;
}

// Mock users currently in the lobby
const LOBBY_MEMBERS = USERS.slice(0, 5);

const LobbyChat: React.FC<LobbyChatProps> = ({ hotel, interest, onClose, onNotify }) => {
  // VIEW STATE: 'lobby' or 'private'
  const [activeView, setActiveView] = useState<'lobby' | 'private'>('lobby');
  const [selectedPrivateUser, setSelectedPrivateUser] = useState<User | null>(null);

  // CHAT STATE
  const [lobbyMessages, setLobbyMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'system',
      userName: 'VibeBot',
      userAvatar: '',
      text: `Welcome to the ${interest} Lobby at ${hotel.name}! 🚀`,
      timestamp: Date.now(),
      isAi: true
    }
  ]);

  // Dictionary to store private messages: userId -> ChatMessage[]
  const [privateMessages, setPrivateMessages] = useState<Record<string, ChatMessage[]>>({});
  
  const [input, setInput] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. REQUEST BROWSER NOTIFICATION PERMISSION ON MOUNT
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // 2. LOAD AI ICEBREAKER
  useEffect(() => {
    if (lobbyMessages.length === 1) {
      const loadIcebreaker = async () => {
        setIsLoadingAi(true);
        const icebreaker = await generateLobbyIcebreaker(interest, hotel.city);
        setLobbyMessages(prev => [
          ...prev, 
          {
            id: 'ai-init',
            userId: 'system',
            userName: 'Vibe AI',
            userAvatar: '',
            text: icebreaker,
            timestamp: Date.now(),
            isAi: true
          }
        ]);
        setIsLoadingAi(false);
      };
      loadIcebreaker();
    }
  }, [hotel, interest]);

  // 3. SCROLL TO BOTTOM
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lobbyMessages, activeView, privateMessages]);

  // 4. SIMULATE EVENTS (New User Joining / Push Notification)
  useEffect(() => {
    const randomTime = Math.random() * 10000 + 5000; // 5-15 seconds
    const timer = setTimeout(() => {
      // Simulate a new user joining
      const newUser = USERS[Math.floor(Math.random() * USERS.length)];
      
      // TRIGGER IN-APP NOTIFICATION
      onNotify({
        id: Date.now().toString(),
        type: 'join',
        title: 'New Vibe Detected!',
        text: `${newUser.name} just joined the ${interest} Lobby.`
      });

      // TRIGGER BROWSER NOTIFICATION
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`VibeLobby: ${newUser.name} joined!`, {
          body: `Say hello in the ${interest} lobby at ${hotel.name}.`,
          icon: newUser.avatar
        });
      }

      // Add system message to lobby
      const sysMsg: ChatMessage = {
        id: 'sys-' + Date.now(),
        userId: 'system',
        userName: 'System',
        userAvatar: '',
        text: `${newUser.name} joined the lobby. Say hi! 👋`,
        timestamp: Date.now(),
        isAi: true
      };
      setLobbyMessages(prev => [...prev, sysMsg]);

    }, randomTime);

    return () => clearTimeout(timer);
  }, [onNotify, interest, hotel.name]);


  // HANDLERS
  const handleUserClick = (user: User) => {
    if (user.id === 'me') return;
    setSelectedPrivateUser(user);
    setActiveView('private');
    
    // Initialize empty chat if not exists
    if (!privateMessages[user.id]) {
      setPrivateMessages(prev => ({
        ...prev,
        [user.id]: []
      }));
    }
  };

  const handleBackToLobby = () => {
    setActiveView('lobby');
    setSelectedPrivateUser(null);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: 'me',
      userName: 'You',
      userAvatar: 'https://i.pravatar.cc/150?u=me',
      text: input,
      timestamp: Date.now()
    };

    if (activeView === 'lobby') {
      setLobbyMessages(prev => [...prev, newMsg]);
      
      // Simulate tribe response in Lobby
      setTimeout(() => {
        const randomUser = LOBBY_MEMBERS[0];
        setLobbyMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          userId: randomUser.id,
          userName: randomUser.name,
          userAvatar: randomUser.avatar,
          text: "Love that energy!",
          timestamp: Date.now()
        }]);
      }, 2000);

    } else if (activeView === 'private' && selectedPrivateUser) {
      // Send Private Message
      const otherUserId = selectedPrivateUser.id;
      setPrivateMessages(prev => ({
        ...prev,
        [otherUserId]: [...(prev[otherUserId] || []), newMsg]
      }));

      // Simulate Private Reply
      setTimeout(() => {
         const replyMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          userId: otherUserId,
          userName: selectedPrivateUser.name,
          userAvatar: selectedPrivateUser.avatar,
          text: "Hey! Nice to connect. Are you staying here long?",
          timestamp: Date.now()
        };
        
        setPrivateMessages(prev => ({
          ...prev,
          [otherUserId]: [...(prev[otherUserId] || []), replyMsg]
        }));
        
        // Notify if user navigated away
        onNotify({
            id: 'pm-' + Date.now(),
            type: 'message',
            title: `Message from ${selectedPrivateUser.name}`,
            text: 'Hey! Nice to connect...'
        });

      }, 1500);
    }

    setInput('');
  };

  const currentMessages = activeView === 'lobby' 
    ? lobbyMessages 
    : (selectedPrivateUser ? privateMessages[selectedPrivateUser.id] || [] : []);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col md:max-w-md md:mx-auto md:h-[80vh] md:top-[10vh] md:rounded-2xl md:shadow-2xl md:border md:border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      
      {/* Header */}
      <div className="bg-brand-600 p-4 text-white shrink-0 shadow-md z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
             {activeView === 'private' && (
               <button onClick={handleBackToLobby} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                 <ChevronLeft size={24} />
               </button>
             )}
             
             <div>
              <h2 className="font-bold text-lg leading-tight flex items-center">
                {activeView === 'lobby' ? `${hotel.name} Lobby` : selectedPrivateUser?.name}
                {activeView === 'lobby' && <span className="ml-2 bg-white/20 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">#{interest}</span>}
              </h2>
              <p className="text-brand-100 text-xs flex items-center gap-1">
                {activeView === 'lobby' ? (
                  <><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/> {hotel.matchingGuestCount} Online</>
                ) : (
                  'Private Conversation'
                )}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">✕</button>
        </div>

        {/* Online Users List (Only in Lobby View) */}
        {activeView === 'lobby' && (
          <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar pb-1">
             {LOBBY_MEMBERS.map(user => (
               <button 
                key={user.id} 
                onClick={() => handleUserClick(user)}
                className="relative shrink-0 group flex flex-col items-center gap-1"
               >
                 <div className="relative">
                   <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-brand-400 group-hover:border-white transition-colors" alt={user.name} />
                   <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-brand-600 rounded-full"></div>
                 </div>
                 <span className="text-[10px] text-white/90 truncate max-w-[50px]">{user.name}</span>
               </button>
             ))}
             <div className="shrink-0 w-10 h-10 rounded-full bg-brand-700/50 flex items-center justify-center border border-brand-500 text-xs font-bold text-white/80">
               +12
             </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {activeView === 'private' && currentMessages.length === 0 && (
           <div className="text-center mt-10 opacity-50">
              <UserIcon size={48} className="mx-auto mb-2 text-gray-300"/>
              <p className="text-sm">Start a private vibe with {selectedPrivateUser?.name}</p>
           </div>
        )}

        {currentMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.userId === 'me' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {msg.userId !== 'me' && !msg.isAi && activeView === 'lobby' && (
              <img 
                src={msg.userAvatar} 
                alt={msg.userName} 
                onClick={() => {
                   const u = LOBBY_MEMBERS.find(m => m.id === msg.userId);
                   if (u) handleUserClick(u);
                }}
                className="w-8 h-8 rounded-full mr-2 self-end cursor-pointer hover:ring-2 hover:ring-brand-200" 
              />
            )}
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm relative ${
              msg.userId === 'me' 
                ? 'bg-brand-500 text-white rounded-br-none' 
                : msg.isAi 
                  ? 'bg-purple-100 text-purple-900 border border-purple-200 w-full text-center italic text-sm my-2' 
                  : 'bg-white text-gray-800 rounded-bl-none'
            }`}>
               {msg.isAi && <Sparkles size={12} className="inline mr-1 text-purple-500" />}
               <span className="block leading-relaxed">{msg.text}</span>
               {msg.userId !== 'me' && !msg.isAi && activeView === 'lobby' && (
                 <span className="text-[10px] opacity-50 block mt-1 font-medium">{msg.userName}</span>
               )}
            </div>
          </div>
        ))}
        {isLoadingAi && <div className="text-center text-xs text-gray-400 flex justify-center items-center gap-1"><Sparkles size={10} className="animate-spin" /> Vibe AI is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={activeView === 'lobby' ? "Message the lobby..." : `Message ${selectedPrivateUser?.name}...`}
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-500"
            autoFocus
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim()}
            className={`p-1.5 rounded-full transition-all ${input.trim() ? 'bg-brand-500 text-white shadow-md transform hover:scale-105' : 'text-gray-400'}`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyChat;