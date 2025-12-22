import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Search, MapPin, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Loader2, ExternalLink, Globe, Flag, LogIn, LogOut, MessageCircle } from 'lucide-react';
import { ACTIVITIES } from './services/mockData';
import { generateSocialForecast, findBestMatchingVibe } from './services/geminiService';
import { ScoredHotel, User } from './types';
import { supabase } from './services/supabaseClient';
import { api } from './services/api';
import { useAuth } from './contexts/AuthContext';
// AffiliateDeepLinker removed - we are now an OTA using Duffel
import SearchCard from './components/SearchCard';
import NotificationToast, { NotificationItem } from './components/NotificationToast';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import type { LegalPage } from './components/LegalModal';

// Lazy Load Heavy Components
const LobbyChat = lazy(() => import('./components/LobbyChat'));
const BookingModal = lazy(() => import('./components/BookingModal'));
const LegalModal = lazy(() => import('./components/LegalModal'));
const ProfileModal = lazy(() => import('./components/ProfileModal'));

const App: React.FC = () => {
  // Auth Context
  const { user, isLoading: isAuthLoading, login, logout } = useAuth();

  // App State
  const [step, setStep] = useState<'home' | 'results' | 'details'>('home');

  // Notification State
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Flow State
  const [showBooking, setShowBooking] = useState(false);
  const [showLobby, setShowLobby] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // GLOBAL UNREAD LISTENER
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('global_notifications');

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log("Global Notification Received:", payload);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  // Reset unread count when lobby opens
  useEffect(() => {
    if (showLobby) {
      setUnreadCount(0);
    }
  }, [showLobby]);

  // Search State
  const [selectedInterest, setSelectedInterest] = useState<string>('');
  const [customInterest, setCustomInterest] = useState<string>('');
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>('');
  const [displaySearchTerm, setDisplaySearchTerm] = useState<string>('');
  const [aiReasoning, setAiReasoning] = useState<string>('');

  const [selectedCity, setSelectedCity] = useState<string>('Barcelona');
  const [results, setResults] = useState<ScoredHotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<ScoredHotel | null>(null);
  const [activeChannel, setActiveChannel] = useState<{ id: string; name: string } | null>(null);

  // Async State
  const [aiForecast, setAiForecast] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Data State (Async Fetched)
  const [relevantUsers, setRelevantUsers] = useState<User[]>([]);

  // Gallery State
  const [detailImageIndex, setDetailImageIndex] = useState(0);

  // Legal Modal State
  const [legalPage, setLegalPage] = useState<LegalPage | null>(null);

  // SEARCH HANDLER
  const handleSearch = async () => {
    const hasCustomInput = customInterest.trim().length > 0;
    const hasSelectedPreset = selectedInterest.length > 0;

    if (!hasCustomInput && !hasSelectedPreset) return;

    setIsAnalyzing(true);
    let targetVibe = selectedInterest;
    let userDisplay = selectedInterest;
    let reasoning = '';

    // 1. AI Mapping (Vibe Check)
    if (hasCustomInput) {
      userDisplay = customInterest;
      setSelectedInterest('');
      const mappingResult = await findBestMatchingVibe(customInterest, ACTIVITIES);
      if (mappingResult) {
        targetVibe = mappingResult.matchedLabel;
        reasoning = mappingResult.reasoning;
      } else {
        targetVibe = customInterest;
      }
    }

    // 2. API Call (Async)
    const trimmedCity = selectedCity.trim();
    try {
      const sortedHotels = await api.hotels.search(targetVibe, trimmedCity);
      setResults(sortedHotels);
      setActiveSearchTerm(targetVibe);
      setDisplaySearchTerm(userDisplay);
      setAiReasoning(reasoning);
      setStep('results');
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // HOTEL SELECTION HANDLER
  const handleHotelSelect = async (hotel: ScoredHotel) => {
    setSelectedHotel(hotel);
    setDetailImageIndex(0);
    setStep('details');

    // Reset secondary data
    setRelevantUsers([]);
    setAiForecast('Analyzing crowd data...');

    // Parallel Fetching: Guests & AI Forecast
    Promise.all([
      api.hotels.getGuests(hotel.id, activeSearchTerm),
      generateSocialForecast(hotel, activeSearchTerm)
    ]).then(([guests, forecast]) => {
      setRelevantUsers(guests);
      setAiForecast(forecast);
    });
  };

  const handleBookClick = () => {
    if (!user) {
      login(); // Prompt login if trying to book
    } else {
      setShowBooking(true);
    }
  };

  const handleDirectBook = (hotel: ScoredHotel) => {
    if (!user) {
      login();
      return;
    }
    setSelectedHotel(hotel);
    setShowBooking(true);
  };

  const handleBookingConfirm = () => {
    setShowBooking(false);
    setShowLobby(true);
  };

  // UI Helpers
  const nextDetailImage = () => {
    if (!selectedHotel) return;
    setDetailImageIndex((prev) => (prev + 1) % selectedHotel.images.length);
  };

  const prevDetailImage = () => {
    if (!selectedHotel) return;
    setDetailImageIndex((prev) => (prev - 1 + selectedHotel.images.length) % selectedHotel.images.length);
  };

  // Image Error Handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${Date.now()}`;
  };

  // ------------------------------------------------------------------
  // LOADING SCREEN (App Initialization)
  // ------------------------------------------------------------------
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg animate-bounce">
          V
        </div>
        <div className="mt-4 flex items-center gap-2 text-gray-500 font-medium">
          <Loader2 className="animate-spin" size={16} /> Connecting to Web3Auth...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 relative">

      <NotificationToast
        notification={activeNotification}
        onClose={() => setActiveNotification(null)}
      />

      <CookieBanner />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setStep('home'); setShowLobby(false); setCustomInterest(''); setSelectedInterest(''); }}>
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
            V
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">VibeLobby</span>
        </div>

        <div className="flex items-center gap-3">
          {step !== 'home' && (
            <div className="hidden md:block text-sm font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              {selectedCity} • {displaySearchTerm}
            </div>
          )}

          {/* User Avatar (Auth State) */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-gray-900">{user.name}</div>
                <div className="text-[10px] text-gray-400 font-mono">
                  {user.walletAddress
                    ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}`
                    : 'Social Login'}
                </div>
              </div>
              <button onClick={() => setShowProfile(true)} className="relative group">
                <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-300 hover:ring-2 hover:ring-brand-200 transition-all">
                  <img
                    src={user.avatar}
                    alt="Me"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-sm"
            >
              <LogIn size={16} /> Sign In
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-md mx-auto w-full pt-6 px-4 min-h-[85vh]">

        {/* VIEW: HOME SEARCH */}
        {step === 'home' && (
          <div className="flex flex-col min-h-[80vh] justify-center py-10">
            <h1 className="text-4xl font-extrabold mb-2 text-gray-900 leading-tight">
              Find your <span className="text-brand-500">people</span>,<br />not just a bed.
            </h1>
            <p className="text-gray-500 mb-8 text-lg">
              Sort hotels by activity density. See who's where before you book.
            </p>

            {/* Interest Input */}
            <div className="space-y-6">

              {/* Preset Buttons */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">What's your vibe?</label>
                <div className="flex flex-wrap gap-3">
                  {ACTIVITIES.map((act) => (
                    <button
                      key={act.id}
                      onClick={() => {
                        setSelectedInterest(act.label);
                        setCustomInterest('');
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedInterest === act.label
                        ? 'bg-brand-600 text-white shadow-lg scale-105'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-50 px-2 text-gray-500 font-medium">Or type a specific interest</span>
                </div>
              </div>

              {/* Custom AI Input */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-300 to-purple-400 rounded-xl opacity-20 group-focus-within:opacity-100 transition duration-300 blur-sm"></div>
                <div className="relative bg-white rounded-xl flex items-center p-1 border border-gray-200 group-focus-within:border-transparent">
                  <Sparkles size={18} className="text-purple-500 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={customInterest}
                    onChange={(e) => {
                      setCustomInterest(e.target.value);
                      if (e.target.value) setSelectedInterest('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g. Crossfit, Raving, Pottery..."
                    className="w-full bg-transparent p-3 outline-none text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* City Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Where to?</label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input
                    type="text"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    placeholder="Try 'Berlin' or 'Bali'..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={(!selectedInterest && !customInterest) || isAnalyzing}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center transition-all
                ${(!selectedInterest && !customInterest) || isAnalyzing
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-600 text-white hover:bg-brand-700'}`}
              >
                {isAnalyzing ? (
                  <><Loader2 className="animate-spin mr-2" /> AI Matching Vibe...</>
                ) : (
                  <>Find My Vibe <Search className="ml-2" size={20} /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* VIEW: RESULTS LIST */}
        {step === 'results' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex justify-between items-baseline mb-4">
              <div>
                <h2 className="text-xl font-bold">Recommended for you</h2>
                {aiReasoning && (
                  <p className="text-xs text-purple-600 font-medium flex items-center mt-1">
                    <Sparkles size={12} className="mr-1" />
                    AI mapped "{displaySearchTerm}" to "{activeSearchTerm}"
                  </p>
                )}
              </div>
              <span className="text-sm text-gray-500">{results.length} results</span>
            </div>

            {/* RESULTS OR FALLBACK */}
            {results.length > 0 ? (
              results.map((hotel) => (
                <SearchCard
                  key={hotel.id}
                  hotel={hotel}
                  searchedInterest={activeSearchTerm}
                  onSelect={handleHotelSelect}
                  onBook={handleDirectBook}
                />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-5 shadow-sm">
                  <Flag size={40} className="fill-brand-100" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">Be the Pioneer in {selectedCity}</h3>
                <p className="text-gray-600 mb-8 max-w-xs mx-auto leading-relaxed">
                  No one has started a <strong>{activeSearchTerm}</strong> lobby here yet.
                  <br /><br />
                  Be the first! Book a stay to <strong>launch the lobby</strong> and set the vibe for travelers arriving this week.
                </p>
                <button
                  onClick={() => {
                    const checkoutUrl = import.meta.env.VITE_DUFFEL_CHECKOUT_URL || 'https://app.duffel.com/037c9bb33f4b9e9f0790d0d/test';
                    window.location.href = checkoutUrl;
                  }}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Search on Duffel <ExternalLink size={18} className="ml-2" />
                </button>
              </div>
            )}

          </div>
        )}

        {/* VIEW: HOTEL DETAILS */}
        {step === 'details' && selectedHotel && (
          <div className="animate-in slide-in-from-right duration-300 pb-24">
            <button
              onClick={() => setStep('results')}
              className="mb-4 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft size={16} className="mr-1" /> Back to results
            </button>

            {/* IMAGE CAROUSEL */}
            <div className="relative w-full h-72 mb-6 group rounded-2xl shadow-md overflow-hidden bg-gray-200">
              <img
                src={selectedHotel.images[detailImageIndex]}
                alt=""
                className="w-full h-full object-cover transition-all duration-300"
              />

              {selectedHotel.images.length > 1 && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                  {/* Arrows */}
                  <button
                    onClick={(e) => { e.stopPropagation(); prevDetailImage(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white text-gray-800 transition-all active:scale-95"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextDetailImage(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white text-gray-800 transition-all active:scale-95"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {selectedHotel.images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all shadow-sm
                        ${idx === detailImageIndex ? 'bg-white w-6' : 'bg-white/50 w-1.5'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 leading-none">{selectedHotel.name}</h1>
                <p className="text-gray-500 mt-1 flex items-center"><MapPin size={14} className="mr-1" /> {selectedHotel.city}</p>
              </div>
              <div className="bg-brand-50 text-brand-700 px-3 py-1 rounded-lg font-bold text-xl">
                ${selectedHotel.pricePerNight}
              </div>
            </div>

            {/* AI SOCIAL FORECAST */}
            <div className="bg-gradient-to-br from-brand-50 to-purple-50 p-5 rounded-xl border border-brand-100 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Search size={100} />
              </div>
              <h3 className="text-sm font-bold text-brand-800 uppercase tracking-wider mb-2 flex items-center">
                AI Social Forecast
              </h3>
              <p className="text-gray-800 font-medium italic leading-relaxed">
                "{aiForecast}"
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Who's Here?</h3>

              {/* MEMBER AVATARS (Data from Async API) */}
              {relevantUsers.length > 0 ? (
                <div className="flex items-center mb-4 overflow-x-auto no-scrollbar pb-2">
                  <div className="flex -space-x-3 px-1">
                    {relevantUsers.map(user => (
                      <div key={user.id} className="relative group/avatar cursor-pointer">
                        <img
                          src={user.avatar}
                          className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover hover:scale-105 transition-transform hover:z-10 hover:border-brand-200"
                          alt={user.name}
                          onError={handleImageError}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {user.name} • {user.bio}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="ml-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                    +{selectedHotel.matchingGuestCount > relevantUsers.length ? selectedHotel.matchingGuestCount - relevantUsers.length : 0} others
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic mb-4">
                  {selectedHotel.id.startsWith('dyn_') ? (
                    `${selectedHotel.matchingGuestCount} ${activeSearchTerm} fans are checking in this week.`
                  ) : (
                    `Be the first ${activeSearchTerm} fan to join!`
                  )}
                </div>
              )}

              {/* INTEREST BREAKDOWN */}
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                {selectedHotel.topInterests.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between mb-3 last:mb-0">
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-3 ${item.label === activeSearchTerm ? 'bg-brand-500' : 'bg-gray-300'}`}></span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-100 rounded-full mr-3 overflow-hidden">
                        <div
                          className={`h-full ${item.label === activeSearchTerm ? 'bg-brand-500' : 'bg-gray-400'}`}
                          style={{ width: `${(item.count / selectedHotel.totalGuestCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-6 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {selectedHotel.amenities.map(amenity => (
                  <span key={amenity} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm">{amenity}</span>
                ))}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">
              {selectedHotel.description}
            </p>

            {/* Sticky Booking Action */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 md:static md:bg-transparent md:border-0 md:p-0">
              <button
                onClick={handleBookClick}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 flex items-center justify-center text-lg"
              >
                Book & Join {activeSearchTerm} Lobby <ArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        )}

      </main>

      <Footer onOpenLegal={(page) => setLegalPage(page)} />

      {/* OVERLAY: BOOKING MODAL */}
      {showBooking && selectedHotel && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}>
          <BookingModal
            hotel={selectedHotel}
            interest={activeSearchTerm}
            onClose={() => setShowBooking(false)}
            onConfirm={handleBookingConfirm}
          />
        </Suspense>
      )}

      {/* OVERLAY: LOBBY CHAT (Always Mounted for Realtime) */}
      {selectedHotel && user && (
        <div className={showLobby ? 'block' : 'hidden'}>
          <Suspense fallback={null}>
            <LobbyChat
              hotel={selectedHotel}
              interest={activeSearchTerm}
              currentUser={user}
              initialMembers={relevantUsers}
              onClose={() => setShowLobby(false)}
              onNotify={setActiveNotification}
              isOpen={showLobby}
              channelId={activeChannel?.id}
              channelName={activeChannel?.name}
            />
          </Suspense>
        </div>
      )}

      {/* OVERLAY: OVERLAYS WRAPPED IN SUSPENSE */}
      <Suspense fallback={<div className="fixed inset-0 bg-black/20 z-[100]" />}>
        {/* OVERLAY: LEGAL MODAL */}
        {legalPage && (
          <LegalModal page={legalPage} onClose={() => setLegalPage(null)} />
        )}

        {/* OVERLAY: PROFILE MODAL */}
        {showProfile && (
          <ProfileModal onClose={() => setShowProfile(false)} />
        )}
      </Suspense>

      {/* FLOATING CHAT BUTTONS */}
      {user && !showLobby && (() => {
        // 1. Find Primary Key (for Hotel Chat) - Default to the first active one
        const primaryKey = user.digitalKeys.find(k => k.status === 'active') || user.digitalKeys[0];

        // 2. Find City Key (for City Chat) - Specifically look for one with a city
        const cityKey = user.digitalKeys.find(k => k.status === 'active' && k.city) || (primaryKey?.city ? primaryKey : undefined);

        if (primaryKey) {
          return (
            <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end animate-in zoom-in duration-300">

              {/* City Chat Button (Secondary) */}
              {cityKey && cityKey.city && (
                <button
                  onClick={() => {
                    const hotelObj: ScoredHotel = {
                      id: cityKey.hotelId,
                      name: cityKey.hotelName,
                      city: cityKey.city,
                      description: '',
                      images: [],
                      pricePerNight: 0,
                      rating: 5,
                      amenities: [],
                      coordinates: { lat: 0, lng: 0 },
                      vibeScore: 100,
                      matchingGuestCount: 0,
                      totalGuestCount: 0,
                      topInterests: []
                    };
                    setSelectedHotel(hotelObj);
                    setActiveSearchTerm('City Vibe');
                    setActiveChannel({ id: `city:${cityKey.city}`, name: cityKey.city });
                    setShowLobby(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-xl transition-transform hover:scale-110 flex items-center gap-2"
                >
                  <Globe size={24} />
                  <span className="font-bold pr-2 hidden md:inline">{cityKey.city} Lobby</span>
                </button>
              )}

              {/* Hotel Chat Button (Primary) */}
              <button
                onClick={() => {
                  const hotelObj: ScoredHotel = {
                    id: primaryKey.hotelId,
                    name: primaryKey.hotelName,
                    city: primaryKey.city || 'Unknown',
                    description: '',
                    images: [],
                    pricePerNight: 0,
                    rating: 5,
                    amenities: [],
                    coordinates: { lat: 0, lng: 0 },
                    vibeScore: 100,
                    matchingGuestCount: 0,
                    totalGuestCount: 0,
                    topInterests: []
                  };
                  setSelectedHotel(hotelObj);
                  setActiveSearchTerm('General');
                  setActiveChannel({ id: primaryKey.hotelId, name: primaryKey.hotelName });
                  setShowLobby(true);
                }}
                className="bg-brand-600 hover:bg-brand-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center gap-2"
              >
                <div className="relative">
                  <MessageCircle size={28} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white border-2 border-white shadow-sm animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="font-bold pr-1 hidden md:inline">{primaryKey.hotelName}</span>
              </button>
            </div>
          );
        } else {
          // No active key? Open a generic "Vibe Lobby"
          return (
            <button
              onClick={() => {
                const genericHotel: ScoredHotel = {
                  id: 'global_lobby',
                  name: 'Vibe Lobby',
                  city: 'Global',
                  description: 'Connect with your vibe tribe.',
                  images: [],
                  pricePerNight: 0,
                  rating: 5,
                  amenities: [],
                  coordinates: { lat: 0, lng: 0 },
                  vibeScore: 0,
                  matchingGuestCount: 0,
                  totalGuestCount: 0,
                  topInterests: []
                };
                setSelectedHotel(genericHotel);
                setActiveSearchTerm('Global');
                setActiveChannel(null); // Use default
                setShowLobby(true);
              }}
              className="fixed bottom-6 right-6 z-40 bg-brand-600 hover:bg-brand-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center gap-2 animate-in zoom-in duration-300"
            >
              <div className="relative">
                <MessageCircle size={28} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white border-2 border-white shadow-sm animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="font-bold pr-1 hidden md:inline">Chats</span>
            </button>
          );
        }
      })()}

    </div>
  );
};

export default App;