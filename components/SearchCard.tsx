import React, { useState } from 'react';
import { ScoredHotel } from '../types';
import { Users, Flame, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

interface SearchCardProps {
  hotel: ScoredHotel;
  searchedInterest: string;
  onSelect: (hotel: ScoredHotel) => void;
  onBook: (hotel: ScoredHotel) => void;
}

const SearchCard: React.FC<SearchCardProps> = ({ hotel, searchedInterest, onSelect, onBook }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const isDynamic = hotel.id.startsWith('dyn_');

  return (
    <div 
      onClick={() => onSelect(hotel)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer mb-4"
    >
      <div className="relative h-56 w-full group">
        <img 
          src={hotel.images[activeImageIndex]} 
          alt={hotel.name} 
          className="w-full h-full object-cover transition-opacity duration-300" 
        />
        
        {/* THE SOCIAL HEATMAP BADGE */}
        {hotel.matchingGuestCount > 0 ? (
          <div className="absolute top-4 left-4 bg-brand-600 text-white px-3 py-1.5 rounded-full flex items-center shadow-lg animate-pulse z-20">
            <Flame size={16} className="mr-1.5 fill-white" />
            <span className="text-xs font-bold uppercase tracking-wide">
              {hotel.matchingGuestCount} {searchedInterest} Fans
            </span>
          </div>
        ) : (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brand-600 px-3 py-1.5 rounded-full flex items-center shadow-lg z-20 border border-brand-100">
             <Sparkles size={16} className="mr-1.5" />
             <span className="text-xs font-bold uppercase tracking-wide">
               Start the {searchedInterest} Vibe
             </span>
          </div>
        )}

        {/* Dynamic / Partner Badge */}
        {isDynamic && (
          <div className="absolute top-4 right-4 bg-blue-600/90 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center shadow-md z-20">
            <ShieldCheck size={12} className="mr-1" /> Partner
          </div>
        )}
        
        {/* THUMBNAIL GALLERY OVERLAY */}
        {hotel.images.length > 1 && (
          <div className="absolute bottom-16 left-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {hotel.images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                className={`w-10 h-10 rounded-lg border-2 overflow-hidden shadow-sm transition-transform ${
                  activeImageIndex === idx 
                    ? 'border-brand-500 scale-110 ring-2 ring-brand-200' 
                    : 'border-white/80 opacity-80 hover:opacity-100 hover:scale-105'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 z-10">
          <h3 className="text-white text-xl font-bold">{hotel.name}</h3>
          <div className="flex items-center text-gray-200 text-sm mt-1">
            <MapPin size={14} className="mr-1" />
            {hotel.city}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Vibe Meter */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex -space-x-2 overflow-hidden">
             {/* Mock avatars for social proof */}
             {hotel.matchingGuestCount > 0 ? (
                // If it's dynamic, we might not have real users, but we can simulate avatars with random seeds
                [...Array(Math.min(4, hotel.matchingGuestCount + 1))].map((_, i) => (
                  <img 
                    key={i}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" 
                    // Use pravatar for reliable face images
                    src={`https://i.pravatar.cc/150?u=${hotel.id}${i}`} 
                    alt="Guest" 
                  />
                ))
             ) : (
                // Show potential placeholder if no one is there
                <div className="flex items-center h-8 px-2 rounded-full bg-gray-50 border border-gray-100 text-[10px] text-gray-400 font-medium">
                  No {searchedInterest} fans yet
                </div>
             )}
            {hotel.totalGuestCount > 4 && hotel.matchingGuestCount > 0 && (
              <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 text-xs text-gray-500 font-medium">
                +{hotel.totalGuestCount - 4}
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-semibold">Vibe Density</p>
            <div className="flex items-center text-brand-600 font-bold">
              <Users size={16} className="mr-1" />
              {Math.min(100, Math.round(hotel.vibeScore))}% Match
            </div>
          </div>
        </div>

        {/* Breakdown of other interests present */}
        <div className="flex flex-wrap gap-2 mt-2">
          {hotel.topInterests.map((interest) => (
            <span 
              key={interest.label}
              className={`text-xs px-2 py-1 rounded-md font-medium border
                ${interest.label === searchedInterest 
                  ? 'bg-brand-50 border-brand-100 text-brand-600' 
                  : 'bg-gray-50 border-gray-100 text-gray-500'}`}
            >
              #{interest.label} ({interest.count})
            </span>
          ))}
        </div>
        
        {/* Price and Action */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-sm">per night</span>
            <span className="text-gray-900 font-bold text-lg">${hotel.pricePerNight}</span>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onBook(hotel);
            }}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center shadow-md active:scale-[0.98]"
          >
            Book & Join {searchedInterest} Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchCard;