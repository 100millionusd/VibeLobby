/**
 * TRIBE STAY DATABASE SCHEMA (TypeScript Representation)
 * 
 * 1. Users Table
 *    - id, name, avatar, bio
 * 
 * 2. Activity_Tags Table
 *    - id, label, category (Sports, Tech, Music), icon
 * 
 * 3. Hotels Table
 *    - id, name, city, images, basePrice
 * 
 * 4. Bookings Table (The Junction Table)
 *    - id, userId, hotelId, dates
 *    - primaryInterest (The crucial field linking a stay to a vibe)
 */

export interface DigitalKey {
  hotelId: string;
  hotelName: string;
  roomType: string;
  checkIn: string; // ISO Date String
  checkOut: string; // ISO Date String
  bookingReference: string;
  status: 'active' | 'future' | 'expired';
  city: string; // [NEW] For City Chat
}

export interface User {
  id: string; // Usually the Web3Auth ID or Wallet Address
  name: string;
  email?: string;
  avatar: string;
  bio: string;
  walletAddress?: string; // ETH Address
  verifier?: string; // 'google', 'facebook', 'ethereum', etc.
  isGuest?: boolean;
  digitalKeys: DigitalKey[]; // Replaces verifiedBookings for time-based access
}

export interface ActivityTag {
  id: string;
  label: string; // e.g., "Techno", "Golf", "Startup"
  category: 'Music' | 'Sport' | 'Professional' | 'Lifestyle';
  color: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  description: string;
  images: string[];
  pricePerNight: number;
  rating: number;
  amenities: string[];
  coordinates: Coordinates;
}

export interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  checkIn: string; // ISO Date
  checkOut: string;
  primaryInterest: string; // Links to ActivityTag.label
}

// Frontend specific types for the algorithm result
export interface ScoredHotel extends Hotel {
  vibeScore: number; // The density score
  matchingGuestCount: number; // "12 Golfers here"
  totalGuestCount: number;
  topInterests: Array<{ label: string; count: number }>;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  image?: string; // Base64 Data URL for image uploads
  timestamp: number;
  isAi?: boolean;
}

export interface Nudge {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
}

// AUTHENTICATION TYPES
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  grantDigitalKey: (confirmation: BookingConfirmationResponse) => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

// DUFFEL / DIRECT BOOKING TYPES
export interface RoomOffer {
  id: string;
  name: string; // e.g., "Standard Double Room"
  description: string;
  price: number;
  currency: string;
  cancellationPolicy: 'refundable' | 'non_refundable';
  bedType: string;
  capacity: number;
}

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string; // E.164
}

export interface BookingConfirmationResponse {
  success: boolean;
  data: {
    booking_reference: string;
    hotel: {
      id: string;
      name: string;
      city: string; // [NEW]
    };
    room: {
      name: string;
    };
    dates: {
      check_in: string;
      check_out: string;
    };
    lobby_access: {
      granted: boolean;
      chat_room_id: string;
      valid_from: string;
      valid_until: string;
    };
  };
}

// GLOBAL WINDOW TYPE FOR DUFFEL COMPONENTS
declare global {
  interface Window {
    DuffelComponents: {
      createCardComponent: (config: {
        clientKey: string;
        styles?: any;
        intent?: 'tokenize' | 'charge';
      }) => {
        mount: (element: HTMLElement) => void;
        unmount: () => void;
        createCardToken: () => Promise<{
          token: string;
          error?: { message: string };
        }>;
      };
    };
  }
}