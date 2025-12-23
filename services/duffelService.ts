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
            radius: 5,
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
        console.warn("Duffel API returned no results. Using mock data.");
        return duffelService.getMockOffers(hotel);
      }

      // 2. Get rates for the first result (Best Match)
      // In a full app, we would let the user choose the hotel from the list.
      // Here we map the "Mock Hotel" to the "First Real Hotel Found".
      const realHotelId = results[0].id;

      const ratesRes = await fetch(`/api/hotels/${realHotelId}/rates`);
      const ratesData = await ratesRes.json();

      // 3. Map Duffel Rates to our RoomOffer type
      return ratesData.map((rate: any) => ({
        id: rate.id, // This is the Rate ID needed for quoting
        name: rate.room_type_name || 'Standard Room',
        description: `Real stay at ${searchData.results[0].name}`,
        price: parseFloat(rate.total_amount),
        currency: rate.total_currency,
        cancellationPolicy: rate.conditions?.cancellation_refund === 'no_refund' ? 'non_refundable' : 'refundable',
        bedType: 'Standard', // Duffel doesn't always return bed type in list
        capacity: 2
      }));

    } catch (error) {
      console.error("Duffel API Error:", error);
      return duffelService.getMockOffers(hotel);
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
  }
};