import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, ChevronLeft, MoreVertical, User as UserIcon, MapPin, Lock, CheckCircle, AlertTriangle, Loader2, Key, Upload, FileImage, Image as ImageIcon, X, Hand, BellRing, Check, Shield } from 'lucide-react';
import { ChatMessage, ScoredHotel, User, Nudge } from '../types';
import { generateLobbyIcebreaker, verifyBookingReceipt } from '../services/geminiService';
import { NotificationItem } from './NotificationToast';
import { api } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface LobbyChatProps {
  hotel: ScoredHotel;
  interest: string;
  currentUser: User;
  initialMembers: User[];
  onClose: () => void;
  onNotify: (notification: NotificationItem) => void;
}

// Haversine formula to calculate distance in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

const LobbyChat: React.FC<LobbyChatProps> = ({ hotel, interest, currentUser, initialMembers, onClose, onNotify }) => {
  const { grantDigitalKey } = useAuth();

  // --- VERIFICATION STATE ---
  const validKey = currentUser.digitalKeys?.find(k =>
    k.hotelId === hotel.id && k.status === 'active'
  );

  const hasDigitalKey = !!validKey;

  const [isAccessGranted, setIsAccessGranted] = useState(hasDigitalKey);
  const [verificationMode, setVerificationMode] = useState<'gps' | 'booking' | null>(null);

  // GPS State
  const [gpsStatus, setGpsStatus] = useState<'pending' | 'verifying' | 'denied' | 'success'>('pending');
  const [gpsMessage, setGpsMessage] = useState('');

  // Booking Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const [analysisText, setAnalysisText] = useState('');
  const [errorText, setErrorText] = useState('');

  // VIEW STATE: 'lobby' or 'private'
  const [activeView, setActiveView] = useState<'lobby' | 'private'>('lobby');
  const [selectedPrivateUser, setSelectedPrivateUser] = useState<User | null>(null);

  // NUDGE STATE
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [pendingNudgeUser, setPendingNudgeUser] = useState<User | null>(null); // User currently being "viewed" for nudge action

  // PRESENCE STATE
  const [onlineMembers, setOnlineMembers] = useState<User[]>(initialMembers);

  // CHAT STATE
  const [lobbyMessages, setLobbyMessages] = useState<ChatMessage[]>([]);
  const [privateMessages, setPrivateMessages] = useState<Record<string, ChatMessage[]>>({});

  const [input, setInput] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // 1. INITIAL LOAD
  // 1. INITIAL LOAD & REAL-TIME SUBSCRIPTION

  useEffect(() => {
    // Load history
    api.chat.getHistory(hotel.id).then(msgs => {
      if (msgs.length > 0) {
        setLobbyMessages(msgs);
      } else {
        setLobbyMessages([{
          id: '1',
          userId: 'system',
          userName: 'VibeBot',
          userAvatar: '',
          text: `Welcome to the ${interest} Lobby at ${hotel.name}! 🚀`,
          timestamp: Date.now(),
          isAi: true
        }]);
      }
    });

    // UNIFIED CHANNEL LOGIC
    const channel = supabase.channel(`lobby:${hotel.id}`);

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `hotel_id=eq.${hotel.id}` },
        (payload) => {
          const m = payload.new as any;
          if (!m.is_private) {
            const newMsg: ChatMessage = {
              id: m.id,
              userId: m.user_id,
              userName: m.user_name,
              userAvatar: m.user_avatar,
              text: m.text,
              image: m.image,
              timestamp: new Date(m.created_at).getTime(),
              isAi: false
            };
            setLobbyMessages(prev => {
              if (prev.find(msg => msg.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineUsers: User[] = [];

        for (const id in state) {
          const presence = state[id][0] as any;
          onlineUsers.push({
            id: presence.user_id,
            name: presence.name,
            avatar: presence.avatar,
            bio: presence.bio,
            digitalKeys: [],
            isGuest: false
          });
        }

        // Merge Real Users with Mock Users (deduplicated)
        const realUserIds = new Set(onlineUsers.map(u => u.id));
        const filteredMocks = initialMembers.filter(m => !realUserIds.has(m.id));

        setOnlineMembers([...onlineUsers, ...filteredMocks]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            bio: currentUser.bio,
            online_at: new Date().toISOString()
          });
        }
      });



    // Load Nudges
    const loadNudges = async () => {
      const myNudges = await api.nudge.getNudges(currentUser.id);
      setNudges(myNudges);
    };
    loadNudges();

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    return () => {
      channel.unsubscribe();
    };
  }, [hotel.id, interest, hotel.name, currentUser.id]);

  // 2. POLLING FOR NUDGES (Simple simulation for real-time vibe updates)
  useEffect(() => {
    if (!isAccessGranted) return;
    const interval = setInterval(async () => {
      const latestNudges = await api.nudge.getNudges(currentUser.id);

      // Check for newly accepted nudges to notify
      setNudges(prev => {
        // Find accepted nudges that were previously pending
        latestNudges.forEach(n => {
          const old = prev.find(p => p.id === n.id);
          if (old && old.status === 'pending' && n.status === 'accepted' && n.fromUserId === currentUser.id) {
            const partner = initialMembers.find(u => u.id === n.toUserId);
            if (partner) {
              onNotify({
                id: Date.now().toString(),
                type: 'message', // using message icon for acceptance
                title: 'Vibe Accepted! ✨',
                text: `${partner.name} accepted your nudge.`
              });
            }
          }
          // Check for new incoming nudges
          if (!old && n.toUserId === currentUser.id && n.status === 'pending') {
            const partner = initialMembers.find(u => u.id === n.fromUserId);
            if (partner) {
              onNotify({
                id: Date.now().toString(),
                type: 'join',
                title: 'Incoming Vibe 👋',
                text: `${partner.name} wants to chat.`
              });
            }
          }
        });
        return latestNudges;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [currentUser.id, isAccessGranted, initialMembers, onNotify]);


  // 3. AI ICEBREAKER
  useEffect(() => {
    if (isAccessGranted && lobbyMessages.length === 1) {
      const loadIcebreaker = async () => {
        setIsLoadingAi(true);
        const icebreaker = await generateLobbyIcebreaker(interest, hotel.city);
        const msg = await api.chat.sendMessage(hotel.id, icebreaker, { id: 'system', name: 'Vibe AI', avatar: '', bio: '', digitalKeys: [] });
        setLobbyMessages(prev => {
          if (prev.find(m => m.text === icebreaker)) return prev;
          return [...prev, { ...msg, isAi: true }];
        });
        setIsLoadingAi(false);
      };
      loadIcebreaker();
    }
  }, [hotel, interest, isAccessGranted, lobbyMessages.length]);

  // 4. SCROLL
  useEffect(() => {
    if (isAccessGranted) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lobbyMessages, activeView, privateMessages, isAccessGranted, pendingImage]);

  // 5. SIMULATE JOIN
  useEffect(() => {
    if (!isAccessGranted || initialMembers.length === 0) return;
    const randomTime = Math.random() * 20000 + 10000;
    const timer = setTimeout(() => {
      const availableMembers = initialMembers.filter(m => m.id !== currentUser.id);
      if (availableMembers.length === 0) return;
      const newUser = availableMembers[Math.floor(Math.random() * availableMembers.length)];

      onNotify({
        id: Date.now().toString(),
        type: 'join',
        title: 'New Vibe Detected!',
        text: `${newUser.name} just joined the ${interest} Lobby.`
      });

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
  }, [onNotify, interest, hotel.name, initialMembers, currentUser.id, isAccessGranted]);

  // --- LOCATION VERIFICATION ---
  const handleVerifyLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      setGpsMessage("Browser doesn't support GPS.");
      return;
    }
    setGpsStatus('verifying');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const hotelLat = hotel.coordinates?.lat || 52.5200;
        const hotelLng = hotel.coordinates?.lng || 13.4050;
        const dist = calculateDistance(userLat, userLng, hotelLat, hotelLng);
        if (dist < 3.0) {
          setGpsStatus('success');
          setGpsMessage("Location Verified! You are on site.");
          setTimeout(() => setIsAccessGranted(true), 1500);
        } else {
          setGpsStatus('denied');
          setGpsMessage(`You are ${dist.toFixed(1)}km away. You must be at the hotel to join.`);
        }
      },
      (error) => {
        setGpsStatus('denied');
        setGpsMessage("Location access denied or signal weak.");
      }
    );
  };

  // --- BOOKING VERIFICATION ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setBookingStatus('idle');
      setErrorText('');
    }
  };

  const handleVerifyBooking = async () => {
    if (!uploadedFile) return;
    setBookingStatus('analyzing');
    setAnalysisText('AI is scanning receipt...');
    const result = await verifyBookingReceipt(uploadedFile, hotel.name, hotel.city);
    if (result.verified) {
      setBookingStatus('success');
      const mockConfirmation = {
        success: true,
        data: {
          booking_reference: "OCR-" + Math.floor(Math.random() * 10000),
          hotel: { id: hotel.id, name: hotel.name },
          room: { name: "Uploaded Receipt Room" },
          dates: { check_in: new Date().toISOString(), check_out: new Date(Date.now() + 86400000 * 3).toISOString() },
          lobby_access: { granted: true, chat_room_id: `chat_${hotel.id}`, valid_from: new Date().toISOString(), valid_until: new Date(Date.now() + 86400000 * 3).toISOString() }
        }
      };
      grantDigitalKey(mockConfirmation);
      setTimeout(() => setIsAccessGranted(true), 1500);
    } else {
      setBookingStatus('error');
      setErrorText(result.message);
    }
  };

  // --- IMAGE UPLOAD ---
  const handleChatImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setPendingImage(reader.result as string);
      reader.readAsDataURL(file);
    }
    if (chatFileInputRef.current) chatFileInputRef.current.value = '';
  };

  // --- NUDGE & USER INTERACTION ---
  const handleUserClick = (user: User) => {
    if (user.id === currentUser.id) return;

    // Check existing nudge status
    const existingNudge = nudges.find(n =>
      (n.fromUserId === currentUser.id && n.toUserId === user.id) ||
      (n.fromUserId === user.id && n.toUserId === currentUser.id)
    );

    if (existingNudge?.status === 'accepted') {
      // Open Chat
      setSelectedPrivateUser(user);
      setActiveView('private');
      if (!privateMessages[user.id]) setPrivateMessages(prev => ({ ...prev, [user.id]: [] }));
      setPendingNudgeUser(null);
    } else {
      // Open Nudge Prompt
      setPendingNudgeUser(user);
    }
  };

  const handleSendNudge = async () => {
    if (!pendingNudgeUser) return;
    const newNudge = await api.nudge.sendNudge(currentUser.id, pendingNudgeUser.id);
    setNudges(prev => [...prev, newNudge]);
    // Stay on the prompt but update status, handled by render logic
  };

  const handleAcceptNudge = async (nudgeId: string) => {
    if (!pendingNudgeUser) return;
    const updated = await api.nudge.respondToNudge(nudgeId, 'accepted');
    if (updated) {
      setNudges(prev => prev.map(n => n.id === updated.id ? updated : n));
      // Automatically transition to chat
      setSelectedPrivateUser(pendingNudgeUser);
      setActiveView('private');
      if (!privateMessages[pendingNudgeUser.id]) setPrivateMessages(prev => ({ ...prev, [pendingNudgeUser.id]: [] }));
      setPendingNudgeUser(null);
    }
  };

  const handleBackToLobby = () => {
    setActiveView('lobby');
    setSelectedPrivateUser(null);
  };

  // --- SEND MESSAGE ---
  const handleSend = async () => {
    if (!input.trim() && !pendingImage) return;

    const isPrivate = activeView === 'private';
    const msgText = input.trim();
    const msgImage = pendingImage || undefined;

    setInput('');
    setPendingImage(null);

    const newMsg = await api.chat.sendMessage(hotel.id, msgText, currentUser, isPrivate, msgImage);

    if (activeView === 'lobby') {
      setLobbyMessages(prev => {
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      if (initialMembers.length > 0 && Math.random() > 0.7) {
        setTimeout(async () => {
          const randomUser = initialMembers[0];
          const replyText = msgImage ? "Nice pic!" : "Love that energy!";
          const reply = await api.chat.sendMessage(hotel.id, replyText, randomUser, false);
          setLobbyMessages(prev => {
            if (prev.find(m => m.id === reply.id)) return prev;
            return [...prev, reply];
          });
        }, 2000);
      }
    } else if (activeView === 'private' && selectedPrivateUser) {
      const otherUserId = selectedPrivateUser.id;
      const recipientUser = selectedPrivateUser;

      setPrivateMessages(prev => ({ ...prev, [otherUserId]: [...(prev[otherUserId] || []), newMsg] }));

      setTimeout(async () => {
        const replies = ["Hey! Totally agree.", "That sounds super cool.", "I'm at the bar if you want to join!", "Haha exactly."];
        const randomReply = msgImage ? "Whoa cool photo! Where is that?" : replies[Math.floor(Math.random() * replies.length)];
        const replyMsg = await api.chat.sendMessage(hotel.id, randomReply, recipientUser, true);

        setPrivateMessages(prev => ({
          ...prev,
          [otherUserId]: [...(prev[otherUserId] || []), replyMsg]
        }));
      }, 2000 + Math.random() * 2000);
    }
  };

  const currentMessages = activeView === 'lobby'
    ? lobbyMessages
    : (selectedPrivateUser ? privateMessages[selectedPrivateUser.id] || [] : []);



  const displayMembers = onlineMembers.slice(0, 6);

  // --- RENDER: GEO-GATE ---
  if (!isAccessGranted) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col md:max-w-md md:mx-auto md:h-[80vh] md:top-[10vh] md:rounded-2xl md:shadow-2xl md:border md:border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-gray-900 p-4 text-white flex justify-between items-center">
          <h2 className="font-bold flex items-center gap-2"><Lock size={16} /> Secure Lobby</h2>
          <button onClick={onClose}><span className="sr-only">Close</span>✕</button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 relative">

          {verificationMode === null && (
            <>
              <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Lock size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Residents Only</h3>
              <p className="text-gray-500 mb-8 max-w-xs">
                To keep the vibe real, this chat is locked for verified guests of <strong>{hotel.name}</strong>.
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => { setVerificationMode('gps'); handleVerifyLocation(); }}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <MapPin size={20} /> I'm here now (GPS)
                </button>
                <button
                  onClick={() => setVerificationMode('booking')}
                  className="w-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Key size={20} /> I have a Booking
                </button>
              </div>
            </>
          )}

          {verificationMode === 'gps' && (
            <>
              {gpsStatus === 'verifying' && (
                <>
                  <Loader2 size={48} className="text-brand-600 animate-spin mb-6" />
                  <h3 className="text-xl font-bold text-gray-900">Checking Location...</h3>
                  <p className="text-sm text-gray-500 mt-2">Triangulating satellite signal.</p>
                </>
              )}
              {gpsStatus === 'success' && (
                <>
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Access Granted</h3>
                  <p className="text-sm text-gray-600 font-medium bg-gray-200 px-3 py-1 rounded-full mb-6">{gpsMessage}</p>
                </>
              )}
              {gpsStatus === 'denied' && (
                <>
                  <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h3>
                  <p className="text-gray-500 mb-6 max-w-xs mx-auto">{gpsMessage}</p>
                  <button onClick={handleVerifyLocation} className="text-brand-600 font-bold hover:underline mb-4">Try GPS Again</button>
                  <div className="w-full h-px bg-gray-200 my-2"></div>
                  <button onClick={() => setVerificationMode('booking')} className="text-gray-500 text-sm mt-4 hover:text-gray-900">Not here yet? Use Booking ID</button>
                </>
              )}
            </>
          )}

          {verificationMode === 'booking' && (
            <>
              {bookingStatus === 'success' ? (
                <>
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <Key size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Verified</h3>
                  <p className="text-sm text-gray-500 mb-6">Welcome, future guest! Your Digital Key is active.</p>
                </>
              ) : (
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setVerificationMode(null)} className="text-gray-400 hover:text-gray-900"><ChevronLeft /></button>
                    <h3 className="font-bold text-lg">Verify via Receipt</h3>
                    <div className="w-6"></div>
                  </div>

                  {bookingStatus === 'analyzing' ? (
                    <div className="flex flex-col items-center py-8">
                      <div className="relative">
                        <Sparkles size={48} className="text-brand-500 animate-pulse" />
                        <Loader2 size={48} className="text-brand-200 animate-spin absolute top-0 left-0" />
                      </div>
                      <p className="mt-6 font-bold text-gray-800">{analysisText}</p>
                      <p className="text-xs text-gray-400 mt-2">AI is reading your screenshot...</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500 mb-6 text-left leading-relaxed">
                        Upload a screenshot of your <strong>Booking Confirmation</strong>.
                        Our AI will verify the hotel name and dates instantly.
                      </p>

                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 mb-6 hover:bg-gray-50 transition-colors relative cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="flex flex-col items-center gap-2">
                          {uploadedFile ? (
                            <>
                              <FileImage size={32} className="text-brand-500" />
                              <span className="text-sm font-medium text-gray-900">{uploadedFile.name}</span>
                            </>
                          ) : (
                            <>
                              <Upload size={32} className="text-gray-400" />
                              <span className="text-sm font-medium text-brand-600">Tap to Upload Screenshot</span>
                            </>
                          )}
                        </div>
                      </div>

                      {bookingStatus === 'error' && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold mb-4">{errorText}</div>}
                      <button onClick={handleVerifyBooking} disabled={!uploadedFile} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">Verify & Unlock</button>
                    </>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    );
  }

  // --- RENDER: NUDGE PROMPT ---
  if (pendingNudgeUser) {
    const existingNudge = nudges.find(n =>
      (n.fromUserId === currentUser.id && n.toUserId === pendingNudgeUser.id) ||
      (n.fromUserId === pendingNudgeUser.id && n.toUserId === currentUser.id)
    );
    const isOutgoing = existingNudge?.fromUserId === currentUser.id;
    const isIncoming = existingNudge?.toUserId === currentUser.id;

    return (
      <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-200">
          <button onClick={() => setPendingNudgeUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"><X size={20} /></button>

          <img src={pendingNudgeUser.avatar} alt={pendingNudgeUser.name} className="w-24 h-24 rounded-full border-4 border-white shadow-lg mb-4 object-cover" />
          <h3 className="text-xl font-bold text-gray-900 mb-1">{pendingNudgeUser.name}</h3>
          <p className="text-sm text-gray-500 mb-6 text-center">{pendingNudgeUser.bio}</p>

          {/* STATE 1: NO NUDGE */}
          {!existingNudge && (
            <>
              <p className="text-sm text-center text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                Start a private vibe? Send a nudge to see if they're available to chat.
              </p>
              <button onClick={handleSendNudge} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105">
                <Hand size={18} /> Send Nudge
              </button>
            </>
          )}

          {/* STATE 2: OUTGOING PENDING */}
          {existingNudge && isOutgoing && existingNudge.status === 'pending' && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 animate-pulse">
                <Send size={20} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Nudge Sent!</h4>
              <p className="text-xs text-gray-500 text-center max-w-[200px]">
                Waiting for {pendingNudgeUser.name} to accept your invitation.
              </p>
            </div>
          )}

          {/* STATE 3: INCOMING PENDING */}
          {existingNudge && isIncoming && existingNudge.status === 'pending' && (
            <>
              <div className="flex items-center gap-2 mb-6 bg-brand-50 text-brand-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide">
                <BellRing size={14} className="animate-bounce" /> Incoming Vibe
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => handleAcceptNudge(existingNudge.id)} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                  <Check size={18} /> Accept
                </button>
                <button onClick={() => setPendingNudgeUser(null)} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl">
                  Decline
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    );
  }

  // --- RENDER: MAIN CHAT ---
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
              <div className="text-brand-100 text-xs flex items-center gap-1.5">
                {activeView === 'lobby' ? (
                  <>
                    <span className={`w-2 h-2 rounded-full ${hasDigitalKey ? 'bg-blue-300' : 'bg-green-400'} animate-pulse`} />
                    {hasDigitalKey ? 'Verified Guest Access' : 'Live at Hotel'} • {onlineMembers.length} Online
                  </>
                ) : (
                  'Private Conversation'
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">✕</button>
        </div>

        {/* Online Users List (Only in Lobby View) */}
        {activeView === 'lobby' && (
          <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {displayMembers.map(user => {
              // Check if there is a pending nudge from this user
              const hasIncoming = nudges.some(n => n.fromUserId === user.id && n.toUserId === currentUser.id && n.status === 'pending');
              const isAccepted = nudges.some(n => (n.fromUserId === user.id && n.toUserId === currentUser.id) || (n.fromUserId === currentUser.id && n.toUserId === user.id) && n.status === 'accepted');

              return (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="relative shrink-0 group flex flex-col items-center gap-1"
                >
                  <div className="relative">
                    <img src={user.avatar} className={`w-10 h-10 object-cover rounded-full border-2 transition-colors ${user.id === currentUser.id ? 'border-green-400' : hasIncoming ? 'border-yellow-400 animate-pulse' : isAccepted ? 'border-blue-300' : 'border-brand-400 group-hover:border-white'}`} alt={user.name} />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-brand-600 rounded-full"></div>
                    {hasIncoming && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white flex items-center justify-center text-[8px] font-bold text-white">!</div>}
                  </div>
                  <span className="text-[10px] text-white/90 truncate max-w-[50px]">{user.id === currentUser.id ? 'You' : user.name}</span>
                </button>
              );
            })}
            {hotel.totalGuestCount > displayMembers.length && (
              <div className="shrink-0 w-10 h-10 rounded-full bg-brand-700/50 flex items-center justify-center border border-brand-500 text-xs font-bold text-white/80">
                +{hotel.totalGuestCount - displayMembers.length}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {activeView === 'private' && currentMessages.length === 0 && (
          <div className="text-center mt-10 opacity-50 flex flex-col items-center">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
              <Shield size={32} className="text-brand-300" />
            </div>
            <p className="text-sm font-bold text-gray-700">Vibe Secured</p>
            <p className="text-xs text-gray-400 max-w-[200px]">You and {selectedPrivateUser?.name} have accepted each other's nudges.</p>
          </div>
        )}

        {currentMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.userId === currentUser.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {msg.userId !== currentUser.id && !msg.isAi && activeView === 'lobby' && (
              <img
                src={msg.userAvatar}
                alt={msg.userName}
                onClick={() => {
                  const u = displayMembers.find(m => m.id === msg.userId);
                  if (u) handleUserClick(u);
                }}
                className="w-8 h-8 object-cover rounded-full mr-2 self-end cursor-pointer hover:ring-2 hover:ring-brand-200"
              />
            )}

            <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm relative ${msg.userId === currentUser.id
              ? 'bg-brand-500 text-white rounded-br-none'
              : msg.isAi
                ? 'bg-purple-100 text-purple-900 border border-purple-200 w-full text-center italic text-sm my-2'
                : 'bg-white text-gray-800 rounded-bl-none'
              }`}>
              {msg.isAi && <Sparkles size={12} className="inline mr-1 text-purple-500" />}

              {msg.image && (
                <div className="mb-2 mt-1">
                  <img src={msg.image} alt="Attachment" className="rounded-lg w-full max-h-60 object-cover border border-black/10" />
                </div>
              )}

              {msg.text && <span className="block leading-relaxed">{msg.text}</span>}

              {msg.userId !== currentUser.id && !msg.isAi && activeView === 'lobby' && (
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

        {pendingImage && (
          <div className="mb-2 flex items-start">
            <div className="relative inline-block">
              <img src={pendingImage} alt="Preview" className="h-20 w-auto rounded-lg border border-gray-200 shadow-sm" />
              <button onClick={() => setPendingImage(null)} className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-0.5 hover:bg-gray-700 shadow-md">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
          {activeView === 'private' && (
            <button onClick={() => chatFileInputRef.current?.click()} className="text-gray-400 hover:text-brand-600 transition-colors">
              <ImageIcon size={20} />
            </button>
          )}
          <input type="file" ref={chatFileInputRef} className="hidden" accept="image/*" onChange={handleChatImageSelect} />
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
            disabled={!input.trim() && !pendingImage}
            className={`p-1.5 rounded-full transition-all ${input.trim() || pendingImage ? 'bg-brand-500 text-white shadow-md transform hover:scale-105' : 'text-gray-400'}`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyChat;