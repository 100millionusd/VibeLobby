import { RoomOffer, ScoredHotel, GuestDetails, BookingConfirmationResponse } from '../types';

/**
 * DUFFEL STAYS API (Simulated)
 * 
 * In a real backend, this would utilize the @duffel/api-node client.
 * Here we mock the search, offer, and order creation flow.
 */

const ROOM_TYPES = [
  { name: 'Standard King', multiplier: 1.0, desc: 'Cozy room with a king-sized bed and city views.', beds: '1 King' },
  { name: 'Double Twin', multiplier: 1.1, desc: 'Two twin beds, perfect for friends sharing the vibe.', beds: '2 Twins' },
  { name: 'Vibe Suite', multiplier: 1.8, desc: 'Spacious suite with lounge area, ideal for pre-drinks.', beds: '1 King + Sofa' },
];

export const duffelService = {

  /**
   * 1. Search for available rooms (Offers)
   * Real Implementation: Calls our Backend -> Duffel API
   */
  searchAccommodations: async (hotel: ScoredHotel, checkIn: Date, checkOut: Date, rooms: number = 1, guests: number = 1): Promise<RoomOffer[]> => {
    try {
      // 1. Search for accommodations near the hotel's location
      const searchRes = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: {
            radius: 10, // Increased to 10km to match successful debug script
            geographic_coordinates: {
              latitude: hotel.coordinates.lat,
              longitude: hotel.coordinates.lng
            }
          },
          checkInDate: checkIn.toISOString().split('T')[0],
          checkOutDate: checkOut.toISOString().split('T')[0],
          guests: Array(guests).fill({ type: 'adult' })
        })
      });

      const searchData = await searchRes.json();

      // Handle Duffel Response (could be array or wrapped in results)
      const results = Array.isArray(searchData) ? searchData : (searchData.results || []);

      if (results.length === 0) {
        console.warn("Duffel API returned no results.");
        throw new Error("No availability found for these dates.");
      }

      // 2. Iterate through results to find one with available rates
      // In Test Mode, some hotels return "cached" availability (Search Result)
      // but "empty" detailed rates (no rooms). We scan up to 20 to find a working one.
      const attempts = results.slice(0, 20);

      console.log(`[Duffel] Scanning top ${attempts.length} hotels for detailed rates...`);

      for (const result of attempts) {
        try {
          const realHotelId = result.id;
          const hotelName = result.accommodation?.name || result.name || 'Unknown Hotel';

          // Log less verbose to avoid spam, unless error
          // console.log(`Checking rates for: ${hotelName}`);

          const ratesRes = await fetch(`/api/hotels/${realHotelId}/rates`);
          const payload = await ratesRes.json();

          // Debug keys to ensure we parsed correctly
          // console.log(`[Duffel] Payload Keys for ${hotelName}:`, Object.keys(payload));

          // Handle wrapping: sometimes payload.rooms, sometimes payload.data.rooms
          const roomsList = payload.rooms || payload.data?.rooms || [];

          if (Array.isArray(roomsList) && roomsList.length > 0) {
            console.log(`[Duffel] SUCCESS: Found ${roomsList.length} rooms for ${hotelName} (${realHotelId})`);

            const allRates = roomsList.flatMap((room: any) => {
              return (room.rates || []).map((rate: any) => ({
                ...rate,
                _roomName: room.name
              }));
            });

            if (allRates.length > 0) {
              return allRates.map((rate: any) => ({
                id: rate.id,
                name: rate._roomName || 'Standard Room',
                description: `Real stay at ${hotelName}`,
                price: parseFloat(rate.total_amount),
                currency: rate.total_currency,
                cancellationPolicy: rate.conditions?.cancellation_refund === 'no_refund' ? 'non_refundable' : 'refundable',
                bedType: 'Standard',
                capacity: 2
              }));
            }
          } else {
            // Checking cheapest_rate specifically as per debug logs
            if (payload.cheapest_rate_total_amount) {
              console.warn(`[Duffel] Hotel ${hotelName} has price ${payload.cheapest_rate_total_amount} but 0 rooms. Test mode quirk? Skipping.`);
            }
          }
        } catch (innerErr) {
          console.warn(`[Duffel] Error fetching rates for result ${result.id}`, innerErr);
        }
      }

      console.error("[Duffel] Critical: No rates found in the scanned results.");
      throw new Error("No bookable rooms found. Please try different dates or location.");

    } catch (error: any) {
      console.error("Duffel API Error:", error);
      throw new Error(error.message || "Failed to search accommodations");
    }
  },

  getMockOffers: (hotel: ScoredHotel): RoomOffer[] => {
    return ROOM_TYPES.map((type, index) => ({
      id: `offer_${hotel.id}_${index}`,
      name: type.name,
      description: type.desc,
      price: Math.round(hotel.pricePerNight * type.multiplier),
      currency: 'USD',
      cancellationPolicy: 'refundable',
      bedType: type.beds,
      capacity: 2
    }));
  },

  /**
   * 2. Create Booking
   */
  bookHotel: async (
    hotel: ScoredHotel,
    offerId: string,
    guest: GuestDetails,
    paymentToken?: string,
    checkInDate?: Date,
    checkOutDate?: Date
  ): Promise<BookingConfirmationResponse> => {

    // 1. Create Quote (Lock Price)
    const quoteRes = await fetch('/api/hotels/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rateId: offerId })
    });
    const quote = await quoteRes.json();

    // 2. Create Booking
    const bookingRes = await fetch('/api/hotels/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteId: quote.id,
        guests: [{
          given_name: guest.firstName,
          family_name: guest.lastName,
          born_on: '1990-01-01', // Placeholder as UI does not collect this
          email: guest.email
        }],
        email: guest.email,
        phoneNumber: '+15555555555', // Placeholder
        paymentToken: paymentToken
      })
    });

    const booking = await bookingRes.json();

    if (!booking.id) {
      throw new Error("Booking failed");
    }

    // Map to Confirmation
    return {
      success: true,
      data: {
        booking_reference: booking.reference,
        hotel: {
          id: hotel.id,
          name: hotel.name,
          city: hotel.city,
        },
        room: {
          name: "Confirmed Room",
        },
        dates: {
          check_in: checkInDate.toISOString(),
          check_out: checkOutDate.toISOString(),
        },
        lobby_access: {
          granted: true,
          chat_room_id: `chat_${hotel.id}`,
          valid_from: checkInDate.toISOString(),
          valid_until: checkOutDate.toISOString()
        }
      }
    };
  },
  /**
   * 3. Search Hotels (Global Search)
   */
  searchHotels: async (
    city: string,
    checkIn: Date,
    checkOut: Date,
    rooms: number = 1,
    guests: number = 1
  ): Promise<ScoredHotel[]> => {

    // 1. Geocode City (Simple Mock for now)
    const cities: Record<string, { lat: number; lng: number }> = {
      'Barcelona': { lat: 41.3851, lng: 2.1734 },
      'London': { lat: 51.5074, lng: -0.1278 },
      'Paris': { lat: 48.8566, lng: 2.3522 },
      'Berlin': { lat: 52.5200, lng: 13.4050 },
      'New York': { lat: 40.7128, lng: -74.0060 },
      'Bali': { lat: -8.4095, lng: 115.1889 },
      'Tokyo': { lat: 35.6762, lng: 139.6503 }
    };

    const coords = cities[city] || cities['Barcelona']; // Default to BCN

    try {
      const searchRes = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: {
            radius: 10,
            geographic_coordinates: {
              latitude: coords.lat,
              longitude: coords.lng
            }
          },
          checkInDate: checkIn.toISOString().split('T')[0],
          checkOutDate: checkOut.toISOString().split('T')[0],
          rooms: rooms,
          guests: Array(guests).fill({ type: 'adult' })
        })
      });

      const searchData = await searchRes.json();
      const results = Array.isArray(searchData) ? searchData : (searchData.results || []);

      if (results.length === 0) {
        return [];
      }

      // Map to Scored Hotel (Enrich with fake Vibe Data)
      return results.map((offer: any) => duffelService.mapDuffelToScoredHotel(offer, city));

    } catch (e) {
      console.error("Duffel Real Search Failed", e);
      throw e; // Propagate error
    }
  },

  mapDuffelToScoredHotel: (offer: any, city: string): ScoredHotel => {
    // Synthetic Vibe Generation
    const vibeScore = 60 + Math.floor(Math.random() * 35); // 60-95
    const guestCount = 5 + Math.floor(Math.random() * 20); // 5-25 guests

    return {
      id: offer.accommodation.id || offer.id,
      name: offer.accommodation.name || offer.name || 'Unknown Hotel',
      city: city,
      description: `Stay at ${offer.accommodation.name}. Great location for meeting fellow travelers.`,
      images: offer.accommodation.photos?.map((p: any) => p.url) || ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000'],
      pricePerNight: parseFloat(offer.total_amount || offer.total_currency_amount || '150'),
      rating: offer.accommodation.rating || 4.5,
      amenities: offer.accommodation.amenities?.slice(0, 5).map((a: any) => a.description || a.key) || ['WiFi', 'Bar', 'Lounge'],
      coordinates: {
        lat: offer.accommodation.location?.geographic_coordinates?.latitude || 0,
        lng: offer.accommodation.location?.geographic_coordinates?.longitude || 0
      },
      vibeScore: vibeScore,
      matchingGuestCount: Math.floor(guestCount * 0.6), // 60% match
      totalGuestCount: guestCount,
      topInterests: [
        { label: 'Techno', count: Math.floor(guestCount * 0.4) },
        { label: 'Startup', count: Math.floor(guestCount * 0.2) }
      ]
    };
  }
};