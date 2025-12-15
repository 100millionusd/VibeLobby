import { Hotel, Booking, ActivityTag, User } from '../types';

export const ACTIVITIES: ActivityTag[] = [
  { id: '1', label: 'Techno', category: 'Music', color: 'bg-purple-500' },
  { id: '2', label: 'Golf', category: 'Sport', color: 'bg-green-500' },
  { id: '3', label: 'Startups', category: 'Professional', color: 'bg-blue-500' },
  { id: '4', label: 'Surfing', category: 'Sport', color: 'bg-cyan-500' },
  { id: '5', label: 'Yoga', category: 'Lifestyle', color: 'bg-rose-500' },
  { id: '6', label: 'Foodie', category: 'Lifestyle', color: 'bg-orange-500' },
  { id: '7', label: 'Crypto', category: 'Professional', color: 'bg-yellow-500' },
  { id: '8', label: 'Hiking', category: 'Sport', color: 'bg-emerald-500' },
  { id: '9', label: 'Art', category: 'Lifestyle', color: 'bg-pink-500' },
  { id: '10', label: 'Gaming', category: 'Lifestyle', color: 'bg-indigo-500' },
];

export const USERS: User[] = [
  { id: 'u1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=u1', bio: 'Techno enthusiast' },
  { id: 'u2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=u2', bio: 'Founder @ Tech' },
  { id: 'u3', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=u3', bio: 'Pro Golfer' },
  { id: 'u4', name: 'Diana', avatar: 'https://i.pravatar.cc/150?u=u4', bio: 'Digital Nomad' },
  { id: 'u5', name: 'Evan', avatar: 'https://i.pravatar.cc/150?u=u5', bio: 'Berghain regular' },
];

export const HOTELS: Hotel[] = [
  {
    id: 'h1',
    name: 'The Generator',
    city: 'Berlin',
    description: 'Industrial chic hostel in the heart of Mitte. Perfect for meeting fellow travelers.',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80', 
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'
    ],
    pricePerNight: 45,
    rating: 4.2,
    amenities: ['Bar', 'Co-working', 'Bike Rental'],
  },
  {
    id: 'h2',
    name: 'Soho House',
    city: 'Berlin',
    description: 'Luxury member club with rooftop pool. The place to be for founders and creatives.',
    images: [
      'https://images.unsplash.com/photo-1571896349842-68c8949139f1?w=800&q=80', 
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80'
    ],
    pricePerNight: 250,
    rating: 4.8,
    amenities: ['Pool', 'Gym', 'Cinema'],
  },
  {
    id: 'h3',
    name: 'Michelberger Hotel',
    city: 'Berlin',
    description: 'Creative hotel near the East Side Gallery. Known for its organic food and art installations.',
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80', 
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80'
    ],
    pricePerNight: 120,
    rating: 4.5,
    amenities: ['Live Music', 'Organic Food'],
  },
  {
    id: 'h4',
    name: 'Uluwatu Surf Villas',
    city: 'Bali',
    description: 'Cliff-front villas with private beach access. World class breaks right at your doorstep.',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'
    ],
    pricePerNight: 180,
    rating: 4.9,
    amenities: ['Surf Rack', 'Infinity Pool'],
  },
  {
    id: 'h5',
    name: 'Nomad Hub',
    city: 'Bali',
    description: 'Co-living space focused on productivity and community events.',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'
    ],
    pricePerNight: 35,
    rating: 4.0,
    amenities: ['High-speed Wifi', 'Meeting Rooms'],
  }
];

// MOCK BOOKINGS TO SIMULATE VIBE
// We purposefully stack "Techno" fans in Hotel H1 and H3, and "Startup" people in H2 and H5.
export const MOCK_BOOKINGS: Booking[] = [
  // Generator Berlin: Techno Hub
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `b_gen_${i}`, userId: `u${i % 5}`, hotelId: 'h1', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Techno'
  })),
  ...Array.from({ length: 3 }).map((_, i) => ({
    id: `b_gen_other_${i}`, userId: `u${i % 5}`, hotelId: 'h1', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Startups'
  })),

  // Soho House Berlin: Startup Hub
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `b_soho_${i}`, userId: `u${i % 5}`, hotelId: 'h2', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Startups'
  })),
  ...Array.from({ length: 2 }).map((_, i) => ({
    id: `b_soho_other_${i}`, userId: `u${i % 5}`, hotelId: 'h2', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Golf'
  })),
  // Add some Crypto bros to Soho House
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `b_soho_crypto_${i}`, userId: `u${i % 5}`, hotelId: 'h2', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Crypto'
  })),

  // Michelberger: Mixed / Foodie / Art
  ...Array.from({ length: 5 }).map((_, i) => ({
    id: `b_mich_${i}`, userId: `u${i % 5}`, hotelId: 'h3', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Techno'
  })),
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: `b_mich_food_${i}`, userId: `u${i % 5}`, hotelId: 'h3', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Foodie'
  })),
  ...Array.from({ length: 6 }).map((_, i) => ({
    id: `b_mich_art_${i}`, userId: `u${i % 5}`, hotelId: 'h3', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Art'
  })),

  // Uluwatu: Surfing / Hiking / Yoga
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: `b_ulu_surf_${i}`, userId: `u${i % 5}`, hotelId: 'h4', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Surfing'
  })),
  ...Array.from({ length: 6 }).map((_, i) => ({
    id: `b_ulu_yoga_${i}`, userId: `u${i % 5}`, hotelId: 'h4', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Yoga'
  })),
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `b_ulu_hike_${i}`, userId: `u${i % 5}`, hotelId: 'h4', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Hiking'
  })),

  // Nomad Hub: Digital Nomad / Crypto / Gaming
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: `b_nomad_crypto_${i}`, userId: `u${i % 5}`, hotelId: 'h5', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Crypto'
  })),
  ...Array.from({ length: 5 }).map((_, i) => ({
    id: `b_nomad_game_${i}`, userId: `u${i % 5}`, hotelId: 'h5', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Gaming'
  })),
];