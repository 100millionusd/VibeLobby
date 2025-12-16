import { Hotel, Booking, ScoredHotel } from '../types';
import { HOTELS, MOCK_BOOKINGS } from './mockData';

/**
 * THE VIBE ALGORITHM
 * 
 * 1. Checks for hardcoded hotels in the city.
 * 2. If none, returns empty array (triggering the "Check Partner" fallback in UI).
 * 3. Scores and sorts them by Social Vibe.
 */
export const getHotelsByActivity = (
  activityLabel: string,
  city: string,
  _date?: string 
): ScoredHotel[] => {
  const cleanCity = city.trim();
  
  // 1. Filter Static Hotels by City
  // In a real production app, this would be an API call to your database
  let candidateHotels: any[] = HOTELS.filter(h => h.city.toLowerCase() === cleanCity.toLowerCase());

  // 2. NO INVENTORY FOUND
  // Instead of generating fake hotels, we return empty.
  // The UI will handle this by showing a "Search Booking.com for [City]" card.
  if (candidateHotels.length === 0) {
      return [];
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