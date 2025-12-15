import React, { useState, useEffect } from 'react';
import { Search, MapPin, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { ACTIVITIES, MOCK_BOOKINGS, USERS } from './services/mockData';
import { getHotelsByActivity } from './services/vibeAlgorithm';
import { generateSocialForecast, findBestMatchingVibe } from './services/geminiService';
import { ScoredHotel } from './types';
import SearchCard from './components/SearchCard';
import LobbyChat from './components/LobbyChat';
import BookingModal from './components/BookingModal';
import NotificationToast, { NotificationItem } from './components/NotificationToast';

const App: React.FC = () => {
  // App State
  const [step, setStep] = useState<'home' | 'results' | 'details'>('home');
  
  // Search State
  const [selectedInterest, setSelectedInterest] = useState<string>('');
  const [customInterest, setCustomInterest] = useState<string>('');
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>(''); // What we actually used for the algorithm (e.g. "Techno")
  const [displaySearchTerm, setDisplaySearchTerm] = useState<string>(''); // What the user typed (e.g. "Raving")
  const [aiReasoning, setAiReasoning] = useState<string>('');
  
  const [selectedCity, setSelectedCity] = useState<string>('Berlin');
  const [results, setResults] = useState<ScoredHotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<ScoredHotel | null>(null);
  
  // Async State
  const [aiForecast, setAiForecast] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Gallery State (for details view)
  const [detailImageIndex, setDetailImageIndex] = useState(0);

  // Flow State
  const [showBooking, setShowBooking] = useState(false);
  const [showLobby, setShowLobby] = useState(false);

  // Notification State
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null);

  const handleSearch = async () => {
    // 1. Determine Input
    const hasCustomInput = customInterest.trim().length > 0;
    const hasSelectedPreset = selectedInterest.length > 0;

    if (!hasCustomInput && !hasSelectedPreset) return;

    setIsAnalyzing(true);
    let targetVibe = selectedInterest;
    let userDisplay = selectedInterest;
    let reasoning = '';

    // 2. AI Mapping Logic (if custom input)
    if (hasCustomInput) {
      userDisplay = customInterest;
      // Clear preset if custom is typed to avoid confusion
      setSelectedInterest(''); 
      
      const mappingResult = await findBestMatchingVibe(customInterest, ACTIVITIES);
      
      if (mappingResult) {
        targetVibe = mappingResult.matchedLabel;
        reasoning = mappingResult.reasoning;
      } else {
        // Fallback if AI fails or no match: Use the raw input (algorithm will likely find 0 exact matches, but that's correct behavior)
        targetVibe = customInterest; 
      }
    }

    // 3. Execute Search Algorithm
    const trimmedCity = selectedCity.trim();
    // The algorithm now handles generating global results for any city
    const sortedHotels = getHotelsByActivity(targetVibe, trimmedCity);

    // 4. Update State
    setResults(sortedHotels);
    setActiveSearchTerm(targetVibe);
    setDisplaySearchTerm(userDisplay);
    setAiReasoning(reasoning);
    setIsAnalyzing(false);
    setStep('results');
  };

  const handleHotelSelect = async (hotel: ScoredHotel) => {
    setSelectedHotel(hotel);
    setDetailImageIndex(0); // Reset gallery
    setStep('details');
    setAiForecast('Analyzing crowd data...');
    const forecast = await generateSocialForecast(hotel, activeSearchTerm);
    setAiForecast(forecast);
  };

  const handleBookClick = () => {
    setShowBooking(true);
  };

  const handleDirectBook = (hotel: ScoredHotel) => {
    setSelectedHotel(hotel);
    setShowBooking(true);
  };

  const handleBookingConfirm = () => {
    setShowBooking(false);
    setShowLobby(true);
  };

  const nextDetailImage = () => {
    if (!selectedHotel) return;
    setDetailImageIndex((prev) => (prev + 1) % selectedHotel.images.length);
  };

  const prevDetailImage = () => {
    if (!selectedHotel) return;
    setDetailImageIndex((prev) => (prev - 1 + selectedHotel.images.length) % selectedHotel.images.length);
  };

  // Helper to get actual users for the selected hotel and interest
  const getRelevantUsers = () => {
    if (!selectedHotel || !activeSearchTerm) return [];
    
    // If it's a dynamic hotel, we don't have hardcoded users in MOCK_BOOKINGS.
    // We can just return empty array for the "Who's Here" avatars section 
    // OR we could generate mock users too. For MVP, showing "12 others" without specific avatars is fine for dynamic hotels.
    if (selectedHotel.id.startsWith('dyn_')) return [];

    const bookings = MOCK_BOOKINGS.filter(
      b => b.hotelId === selectedHotel.id && b.primaryInterest === activeSearchTerm
    );
    
    const relevantUsers = bookings
      .map(b => USERS.find(u => u.id === b.userId))
      .filter((u): u is typeof USERS[0] => !!u);
      
    // Deduplicate
    return Array.from(new Set(relevantUsers.map(u => u.id)))
      .map(id => relevantUsers.find(u => u.id === id)!);
  };

  const relevantUsers = getRelevantUsers();

  // Renders
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      
      <NotificationToast 
        notification={activeNotification} 
        onClose={() => setActiveNotification(null)} 
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setStep('home'); setShowLobby(false); setCustomInterest(''); setSelectedInterest(''); }}>
          
          {/* LOGO: Reverted to Simple Design */}
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
            V
          </div>

          <span className="font-bold text-xl tracking-tight text-gray-900">VibeLobby</span>
        </div>
        {step !== 'home' && (
           <div className="text-xs md:text-sm font-medium bg-gray-100 px-3 py-1 rounded-full truncate max-w-[150px] md:max-w-none">
             {selectedCity} • {displaySearchTerm}
           </div>
        )}
      </nav>

      <main className="max-w-md mx-auto w-full pt-6 px-4">
        
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
                        setCustomInterest(''); // Clear custom input if preset selected
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedInterest === act.label
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
                        if (e.target.value) setSelectedInterest(''); // Clear preset if typing
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
                    placeholder="Enter city (e.g. Berlin)"
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

            {results.map((hotel) => (
              <SearchCard 
                key={hotel.id} 
                hotel={hotel} 
                searchedInterest={activeSearchTerm}
                onSelect={handleHotelSelect}
                onBook={handleDirectBook}
              />
            ))}
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
                <p className="text-gray-500 mt-1 flex items-center"><MapPin size={14} className="mr-1"/> {selectedHotel.city}</p>
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
              
              {/* MEMBER AVATARS */}
              {relevantUsers.length > 0 ? (
                <div className="flex items-center mb-4 overflow-x-auto no-scrollbar pb-2">
                  <div className="flex -space-x-3 px-1">
                    {relevantUsers.map(user => (
                      <div key={user.id} className="relative group/avatar cursor-pointer">
                        <img 
                          src={user.avatar} 
                          className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover hover:scale-105 transition-transform hover:z-10 hover:border-brand-200" 
                          alt={user.name} 
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
                     // Fallback text for dynamic hotels where we don't have user avatars
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
      
      {/* OVERLAY: BOOKING MODAL */}
      {showBooking && selectedHotel && (
        <BookingModal
          hotel={selectedHotel}
          interest={activeSearchTerm}
          onClose={() => setShowBooking(false)}
          onConfirm={handleBookingConfirm}
        />
      )}

      {/* OVERLAY: LOBBY CHAT */}
      {showLobby && selectedHotel && (
        <LobbyChat 
          hotel={selectedHotel} 
          interest={activeSearchTerm} 
          onClose={() => setShowLobby(false)} 
          onNotify={setActiveNotification}
        />
      )}

    </div>
  );
};

export default App;