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
   * Mimics: duffel.stays.search(...)
   */
  searchAccommodations: async (hotel: ScoredHotel, checkIn: Date, checkOut: Date): Promise<RoomOffer[]> => {
    // Simulate API network latency
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Generate offers based on the hotel's base price
    return ROOM_TYPES.map((type, index) => ({
      id: `off_${hotel.id}_${index}`,
      name: type.name,
      description: type.desc,
      price: Math.floor(hotel.pricePerNight * type.multiplier),
      currency: 'USD',
      cancellationPolicy: index === 0 ? 'non_refundable' : 'refundable',
      bedType: type.beds,
      capacity: 2
    }));
  },

  /**
   * 2. API Integration Service: bookHotelAndUnlockLobby
   * 
   * Handles the complete flow for "Agency/Pass-through" Model:
   * - Accepts payment token from Duffel Components (Frontend).
   * - Calls Duffel API to create order, passing the token directly.
   * - The Hotel is the Merchant of Record. We do not touch funds.
   * - Unlocks the "Lobby Chat" access on success.
   * 
   * @param offerId - The Duffel Offer ID
   * @param guest - Guest details
   * @param paymentToken - The tokenized card from frontend (tok_...)
   */
  bookHotelAndUnlockLobby: async (
    hotel: ScoredHotel,
    offerId: string, 
    guest: GuestDetails, 
    paymentToken: string,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<BookingConfirmationResponse> => {
    
    // Simulate API Network Latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    // --- MOCK DUFFEL API CALL ---
    /*
      In production, this would look like:

      const order = await duffel.stays.orders.create({
        selected_offers: [offerId],
        payments: [{
          type: "card", // Pass-through model
          token: paymentToken, // Token from frontend
          amount: offerAmount,
          currency: offerCurrency
        }],
        guests: [{
          email: guest.email,
          given_name: guest.firstName,
          family_name: guest.lastName,
          ...
        }]
      });
    */

    // MOCK: Simulate Card Decline scenarios
    if (guest.firstName.toLowerCase() === 'decline') {
       throw new Error("Payment method declined by the hotel (Simulated).");
    }

    // MOCK: Generate dates for the response
    const validFrom = checkInDate.toISOString();
    const validUntil = checkOutDate.toISOString();

    // Standardized JSON Response for Frontend
    const mockResponse: BookingConfirmationResponse = {
      success: true,
      data: {
        booking_reference: `DUF-${Math.floor(Math.random() * 1000000)}`,
        hotel: {
          id: hotel.id,
          name: hotel.name,
        },
        room: {
          name: "Standard King Room", // In real app, look up from offerId
        },
        dates: {
          check_in: validFrom,
          check_out: validUntil,
        },
        // The "Vibe Trigger" - Instant Unlock Data
        lobby_access: {
          granted: true,
          chat_room_id: `chat_${hotel.id}`,
          valid_from: validFrom,
          valid_until: validUntil
        }
      }
    };

    return mockResponse;
  }
};