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

export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

export interface ActivityTag {
  id: string;
  label: string; // e.g., "Techno", "Golf", "Startup"
  category: 'Music' | 'Sport' | 'Professional' | 'Lifestyle';
  color: string;
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
  timestamp: number;
  isAi?: boolean;
}