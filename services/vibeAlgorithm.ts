import { Hotel, Booking, ScoredHotel } from '../types';
import { HOTELS, MOCK_BOOKINGS } from './mockData';

/**
 * HELPER: Generate realistic hotel names and data for any city
 * This simulates calling the Booking.com API for a city we don't have hardcoded.
 */
const generateDynamicHotels = (city: string, activityLabel: string): ScoredHotel[] => {
  const suffixes = ['Grand Hotel', 'City Stay', 'Boutique Hostel', 'Resort & Spa', 'Suites', 'Social Hub'];
  const adjectives = ['The Royal', 'Downtown', 'Urban', 'Cozy', 'Luxury', 'Central'];
  
  // Deterministic "random" count based on city name length to keep it consistent-ish
  const count = 5 + (city.length % 3); 
  
  return Array.from({ length: count }).map((_, i) => {
    // Generate a name
    const adj = adjectives[i % adjectives.length];
    const suf = suffixes[i % suffixes.length];
    const name = `${adj} ${city} ${suf}`;
    
    // Simulate Price
    const price = 50 + ((i * 37) % 300);

    // Simulate "Vibe" Data
    // We want at least one hotel to be a "Hotspot" for the searched activity
    const isHotspot = i === 0 || i === 3;
    const matchingGuests = isHotspot 
      ? 5 + Math.floor(Math.random() * 12) // 5-16 people matching
      : Math.floor(Math.random() * 3);     // 0-2 people matching
    
    const totalGuests = matchingGuests + Math.floor(Math.random() * 20) + 2;

    // Construct top interests
    const topInterests = [];
    if (matchingGuests > 0) {
      topInterests.push({ label: activityLabel, count: matchingGuests });
    }
    // Add random noise interests
    const otherInterests = ['Foodie', 'Sightseeing', 'Business', 'Relaxation'];
    topInterests.push({ 
      label: otherInterests[i % otherInterests.length], 
      count: Math.floor(Math.random() * 5) + 1 
    });

    const vibeScore = (matchingGuests * 10) + (totalGuests * 0.5);

    return {
      id: `dyn_${city}_${i}`,
      name: name,
      city: city, // Use the user's input city
      description: `Experience the best of ${city} at ${name}. Rated highly by ${activityLabel} enthusiasts. Book instantly via our partner network.`,
      images: [
        // LoremFlickr is generally more reliable for specific keywords like hotel/bedroom than random Picsum seeds
        `https://loremflickr.com/800/600/hotel,resort?lock=${city.length}${i}`,
        `https://loremflickr.com/800/600/bedroom,interior?lock=${city.length}${i}b`
      ],
      pricePerNight: price,
      rating: 4.0 + (i % 10) / 10,
      amenities: ['Free WiFi', 'Partner Hotel', 'Central Location'],
      vibeScore,
      matchingGuestCount: matchingGuests,
      totalGuestCount: totalGuests,
      topInterests: topInterests.sort((a, b) => b.count - a.count)
    };
  });
};

/**
 * THE VIBE ALGORITHM
 * 
 * 1. Checks for hardcoded hotels in the city.
 * 2. If none, generates dynamic inventory (Booking.com simulation).
 * 3. Scores and sorts them by Social Vibe.
 */
export const getHotelsByActivity = (
  activityLabel: string,
  city: string,
  _date?: string 
): ScoredHotel[] => {
  const cleanCity = city.trim();
  
  // 1. Filter Static Hotels by City
  let candidateHotels: any[] = HOTELS.filter(h => h.city.toLowerCase() === cleanCity.toLowerCase());
  let isDynamic = false;

  // 2. DYNAMIC FALLBACK (Booking.com Simulation)
  // If no static hotels exist for this city, we generate them.
  if (candidateHotels.length === 0) {
      // Generate generic hotels for this city so the user gets results ANYWHERE.
      const dynamicHotels = generateDynamicHotels(cleanCity, activityLabel);
      
      // We return these directly as they are already "ScoredHotel" objects from the generator
      return dynamicHotels.sort((a, b) => b.vibeScore - a.vibeScore);
  }

  // 3. Score Static Hotels (if we found them)
  const scoredHotels = candidateHotels.map(hotel => {
    // Get all bookings for this hotel
    const hotelBookings = MOCK_BOOKINGS.filter(b => b.hotelId === hotel.id);
    
    // Count exact matches for the user's interest
    const interestMatches = hotelBookings.filter(
      b => b.primaryInterest.toLowerCase() === activityLabel.toLowerCase()
    ).length;

    // Calculate aggregated interest profile
    const interestCounts: Record<string, number> = {};
    hotelBookings.forEach(b => {
      interestCounts[b.primaryInterest] = (interestCounts[b.primaryInterest] || 0) + 1;
    });

    const topInterests = Object.entries(interestCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const vibeScore = (interestMatches * 10) + (hotelBookings.length * 0.5);

    return {
      ...hotel,
      vibeScore,
      matchingGuestCount: interestMatches,
      totalGuestCount: hotelBookings.length,
      topInterests
    };
  });

  return scoredHotels.sort((a, b) => b.vibeScore - a.vibeScore);
};