import { RoomOffer, ScoredHotel, GuestDetails, BookingConfirmationResponse } from '../types';

/**
 * DUFFEL STAYS API (Simulated)
 * 
 * In a real backend, this would utilize the @duffel/api-node client.
 * Here we mock the search, offer, and order creation flow.
 */

/**
 * DUFFEL STAYS API (Simulated)
 * 
 * In a real backend, this would utilize the @duffel/api-node client.
 * Here we mock the search, offer, and order creation flow.
 */

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
          // Ensure inputs are valid Date dates before converting
          checkInDate: new Date(checkIn).toISOString().split('T')[0],
          checkOutDate: new Date(checkOut).toISOString().split('T')[0],
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

          let roomsList: any[] = [];

          // Debug Logging: Print the hotel we are checking
          console.log(`Checking rates for: ${hotelName} (${realHotelId})`);

          // Strategy A: Check if Search Result already has rooms (inside accommodation)
          if (Array.isArray(result.accommodation?.rooms) && result.accommodation.rooms.length > 0) {
            console.log(`[Duffel] Found rooms in initial search for ${hotelName}`);
            roomsList = result.accommodation.rooms;
          } else {
            // Strategy B: Fetch Rates Endpoint
            const ratesRes = await fetch(`/api/hotels/${realHotelId}/rates`);
            const payload = await ratesRes.json();

            // --- DEBUG BLOCK STARTS ---
            if (results.indexOf(result) === 0) {
              // Log the FULL payload for the first result to debug structure
              console.log(`[Duffel] Payload Keys for ${hotelName}:`, Object.keys(payload));
              // console.log(`[Duffel] Full Payload Dump:`, JSON.stringify(payload)); 
            }
            // --- DEBUG BLOCK ENDS ---

            // Universal Room Extraction: strictly check for ARRAYS
            // 'rooms' might be an integer (count) in test mode, so we must ignore it if it's not an array.
            const candidates = [
              payload.rooms,
              payload.data?.rooms,
              payload.accommodation?.rooms,
              payload.data?.accommodation?.rooms
            ];

            roomsList = candidates.find(c => Array.isArray(c)) || [];


            console.log(`[Duffel] SUCCESS: Found ${roomsList.length} rooms for ${hotelName} (${realHotelId})`);

            // --- DEBUG ROOM STRUCTURE ---
            roomsList.forEach((r: any, i: number) => {
              if (i === 0) {
                console.log(`[Duffel] Room Keys available:`, Object.keys(r));
                console.log(`[Duffel] Room Photos Dump for first room:`, JSON.stringify(r.photos));
              }
            });

            const allRates = roomsList.flatMap((room: any) => {
              // Fallback to Main Hotel Images if room has none
              // Note: hotel.images is passed into searchAccommodations(hotel...)
              const roomImages = room.photos?.map((p: any) => p.url) || [];
              const effectiveImages = roomImages.length > 0 ? roomImages : (hotel.images || []);

              return (room.rates || []).map((rate: any) => ({
                ...rate,
                _roomName: room.name || rate._roomName,
                _roomDescription: room.description || `Experience the ${room.name || 'stay'} at ${hotelName}.`, // Improved default
                _roomPhotos: effectiveImages,
                price: parseFloat(rate.total_amount),
                currency: rate.total_currency,
                cancellationPolicy: rate.conditions?.cancellation_refund === 'no_refund' ? 'non_refundable' : 'refundable',
                bedType: 'Standard',
                capacity: 2
              }));
            });

            if (allRates.length > 0) {
              return allRates.map((rate: any) => ({
                id: rate.id,
                name: rate._roomName || 'Standard Room',
                description: rate._roomDescription,
                photos: rate._roomPhotos || [],
                price: rate.price,
                currency: rate.currency,
                cancellationPolicy: rate.cancellationPolicy,
                bedType: rate.bedType,
                capacity: rate.capacity
              }));
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

  /**
   * 2. Create Booking
   */
  /**
   * 2a. Create Quote (Lock Price)
   */
  createQuote: async (offerId: string): Promise<any> => {
    const res = await fetch('/api/hotels/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rateId: offerId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Quote creation failed");
    return data;
  },

  /**
   * 2b. Create Payment Intent (Get Client Token)
   */
  createPaymentIntent: async (amount: string, currency: string): Promise<string> => {
    const res = await fetch('/api/hotels/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency })
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Payment Intent Error Body:", data);
      throw new Error(data.error || JSON.stringify(data) || "Payment Intent failed");
    }
    return data.client_token;
  },

  /**
   * 2c. Finalize Booking (After Payment Scucess)
   */
  finalizeBooking: async (
    quoteId: string,
    guest: GuestDetails,
    checkInDate: Date,
    checkOutDate: Date,
    hotel: ScoredHotel,
    userId?: string
  ): Promise<BookingConfirmationResponse> => {

    // Call Booking Endpoint (which now uses type: 'balance')
    // We assume the Payment Intent has succeeded and funded the balance.
    const bookingRes = await fetch('/api/hotels/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteId: quoteId,
        guests: [{
          given_name: guest.firstName,
          family_name: guest.lastName,
          born_on: '1990-01-01',
          email: guest.email
        }],
        email: guest.email,
        phoneNumber: guest.phoneNumber || '+16505550100', // Default if missing
        metadata: { userId } // [NEW] Pass Metadata
        // No paymentToken needed here because we paid via Intent -> Balance
      })
    });

    const booking = await bookingRes.json();

    if (!bookingRes.ok) {
      console.error("Booking Failed Backend Response:", booking);
      throw new Error(booking.error || (booking.details ? JSON.stringify(booking.details) : "Booking failed at backend"));
    }

    if (!booking.id) {
      throw new Error("Booking response missing ID");
    }

    // Map to Confirmation
    return {
      success: true,
      data: {
        booking_reference: booking.reference,
        booking_id: booking.id, // [NEW]
        hotel: {
          id: hotel.id,
          name: hotel.name,
          city: hotel.city,
          key_collection: booking.accommodation?.key_collection // [NEW]
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
      console.log(`[Duffel] Searching Hotels in ${city} (${coords.lat}, ${coords.lng})`);
      console.log(`[Duffel] Params: CheckIn=${checkIn.toISOString()}, CheckOut=${checkOut.toISOString()}, Rooms=${rooms}, Guests=${guests}`);

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
          checkOutDate: checkOut.toISOString().split('T')[0], // Ensure this is not same as checkIn
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
      description: cleanDescription(offer.accommodation.description) || `Stay at ${offer.accommodation.name}. Great location for meeting fellow travelers.`,
      images: offer.accommodation.photos?.map((p: any) => p.url) || ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000'],
      pricePerNight: parseFloat(offer.cheapest_rate_total_amount || offer.total_amount || offer.total_currency_amount || '150'),
      rating: offer.accommodation.rating || 4.5,
      amenities: offer.accommodation.amenities?.map((a: any) => a.description || a.key) || ['WiFi', 'Bar', 'Lounge'],
      coordinates: {
        lat: offer.accommodation.location?.geographic_coordinates?.latitude || 0,
        lng: offer.accommodation.location?.geographic_coordinates?.longitude || 0
      },
      checkInTime: offer.accommodation.check_in_information?.check_in_after_time,
      checkOutTime: offer.accommodation.check_in_information?.check_out_before_time,
      reviewScore: offer.accommodation.review_score,
      reviewCount: offer.accommodation.review_count,
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

// Helper: Fix doubled descriptions from API
// Helper: Fix doubled descriptions from API
function cleanDescription(desc: string | undefined): string {
  if (!desc) return '';

  // Robust Strategy: Check if the second half STARTS with the first half (fuzzy match)
  const len = desc.length;
  // We scan from the midpoint backwards.
  for (let i = Math.floor(len / 2); i >= 20; i--) {
    const firstHalf = desc.substring(0, i).trim();
    const secondHalf = desc.substring(i).trim();

    // 1. Exact match
    if (firstHalf === secondHalf) return firstHalf;

    // 2. Fuzzy match: If the second half starts with the first half (ignoring trailing punctuation)
    if (secondHalf.startsWith(firstHalf)) return firstHalf;

    // 3. Sentence match: If first half is > 50 chars and present in second half
    if (firstHalf.length > 50 && secondHalf.includes(firstHalf)) return firstHalf;
  }
  return desc;
}