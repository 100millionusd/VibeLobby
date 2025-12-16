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
  { id: 'u1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=u1', bio: 'Techno enthusiast', digitalKeys: [] },
  { id: 'u2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=u2', bio: 'Founder @ Tech', digitalKeys: [] },
  { id: 'u3', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=u3', bio: 'Pro Golfer', digitalKeys: [] },
  { id: 'u4', name: 'Diana', avatar: 'https://i.pravatar.cc/150?u=u4', bio: 'Digital Nomad', digitalKeys: [] },
  { id: 'u5', name: 'Evan', avatar: 'https://i.pravatar.cc/150?u=u5', bio: 'Berghain regular', digitalKeys: [] },
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
    coordinates: { lat: 52.5269, lng: 13.3915 } // Oranienburger Str.
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
    coordinates: { lat: 52.5276, lng: 13.4116 } // Torstraße
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
    coordinates: { lat: 52.5036, lng: 13.4475 } // Warschauer Str.
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
    coordinates: { lat: -8.8149, lng: 115.0884 } // Uluwatu
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
    coordinates: { lat: -8.5132, lng: 115.2635 } // Ubud area
  },
  {
    id: 'h6',
    name: 'W Barcelona',
    city: 'Barcelona',
    description: 'Iconic sail-shaped hotel on the beach with panoramic views and a glamorous rooftop bar.',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80'
    ],
    pricePerNight: 350,
    rating: 4.7,
    amenities: ['Beachfront', 'Infinity Pool', 'Nightclub'],
    coordinates: { lat: 41.3684, lng: 2.1901 }
  },
  {
    id: 'h7',
    name: 'Generator Barcelona',
    city: 'Barcelona',
    description: 'Vibrant design hostel in Gràcia. A hotspot for backpackers and art lovers.',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'
    ],
    pricePerNight: 40,
    rating: 4.3,
    amenities: ['Bar', 'Lounge', 'Events'],
    coordinates: { lat: 41.3985, lng: 2.1627 }
  },
  {
    id: 'h8',
    name: 'Casa Bonay',
    city: 'Barcelona',
    description: 'A restored neoclassical building with a rooftop orchard and local coffee shop vibe.',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80'
    ],
    pricePerNight: 160,
    rating: 4.6,
    amenities: ['Rooftop', 'Specialty Coffee', 'Yoga'],
    coordinates: { lat: 41.3941, lng: 2.1764 }
  },
  {
    id: 'h9',
    name: 'Cotton House Hotel',
    city: 'Barcelona',
    description: 'Sophisticated luxury with a colonial touch. Great for high-end networking.',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80'
    ],
    pricePerNight: 280,
    rating: 4.8,
    amenities: ['Library', 'Pool', 'Tailor'],
    coordinates: { lat: 41.3922, lng: 2.1711 }
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

  // W Barcelona: Art / Startups / Techno
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `b_w_barca_${i}`, userId: `u${i % 5}`, hotelId: 'h6', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Art'
  })),
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: `b_w_barca_tech_${i}`, userId: `u${i % 5}`, hotelId: 'h6', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Startups'
  })),

  // Generator Barcelona: Foodie / Techno / Hiking
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: `b_gen_barca_food_${i}`, userId: `u${i % 5}`, hotelId: 'h7', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Foodie'
  })),
  ...Array.from({ length: 6 }).map((_, i) => ({
    id: `b_gen_barca_hike_${i}`, userId: `u${i % 5}`, hotelId: 'h7', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Hiking'
  })),

  // Casa Bonay: Yoga / Art
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: `b_casa_bonay_yoga_${i}`, userId: `u${i % 5}`, hotelId: 'h8', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Yoga'
  })),
  ...Array.from({ length: 5 }).map((_, i) => ({
    id: `b_casa_bonay_art_${i}`, userId: `u${i % 5}`, hotelId: 'h8', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Art'
  })),

  // Cotton House: Golf / Startups
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: `b_cotton_golf_${i}`, userId: `u${i % 5}`, hotelId: 'h9', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Golf'
  })),
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `b_cotton_tech_${i}`, userId: `u${i % 5}`, hotelId: 'h9', checkIn: '2023-10-01', checkOut: '2023-10-05', primaryInterest: 'Startups'
  })),
];