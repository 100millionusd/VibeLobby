import { ScoredHotel, User, ChatMessage, Nudge } from '../types';
import { getHotelsByActivity } from './vibeAlgorithm';
import { MOCK_BOOKINGS, USERS } from './mockData';

// Helper to simulate network latency (300-800ms) - essential for testing loading states
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- IN-MEMORY DATABASE (Simulates Backend) ---
const DB = {
  messages: {} as Record<string, ChatMessage[]>, // hotelId -> messages[]
  nudges: [] as Nudge[]
};

/**
 * PRODUCTION READY API LAYER
 * 
 * This object mimics a real backend client (like SupabaseClient).
 * Currently, it wraps our local algorithms and mock data in async functions.
 * When ready for production, we simply replace the body of these functions 
 * to call the real database, without breaking the UI.
 */
export const api = {
  
  auth: {
    /**
     * Get the current session. 
     * In production: supabase.auth.getSession()
     */
    getSession: async (): Promise<User | null> => {
      await delay(500); // Simulate check
      const stored = localStorage.getItem('vibe_user');
      return stored ? JSON.parse(stored) : null;
    },

    /**
     * Login anonymously or as a specific user type.
     */
    loginAsGuest: async (): Promise<User> => {
      await delay(600);
      const guestUser: User = {
        id: `guest_${Date.now()}`,
        name: 'Guest Explorer',
        avatar: 'https://i.pravatar.cc/150?u=me_guest',
        bio: 'Just vibing',
        isGuest: true,
        digitalKeys: [] // Initialize empty keys
      };
      localStorage.setItem('vibe_user', JSON.stringify(guestUser));
      return guestUser;
    },

    logout: async () => {
      await delay(200);
      localStorage.removeItem('vibe_user');
    }
  },

  hotels: {
    /**
     * Search logic - currently runs the local algorithm.
     * In production: Call an Edge Function or SQL query.
     */
    search: async (interest: string, city: string): Promise<ScoredHotel[]> => {
      await delay(600); // Simulate API crunching numbers
      return getHotelsByActivity(interest, city);
    },

    /**
     * Get users specific to a hotel and interest (The "Tribe")
     */
    getGuests: async (hotelId: string, interest: string): Promise<User[]> => {
      await delay(300);
      
      // Dynamic hotels don't have hardcoded bookings in our mock DB
      if (hotelId.startsWith('dyn_')) return [];

      const bookings = MOCK_BOOKINGS.filter(
        b => b.hotelId === hotelId && b.primaryInterest === interest
      );
      
      const relevantUsers = bookings
        .map(b => USERS.find(u => u.id === b.userId))
        .filter((u): u is User => !!u);
        
      // Deduplicate by ID
      return Array.from(new Set(relevantUsers.map(u => u.id)))
        .map(id => relevantUsers.find(u => u.id === id)!);
    }
  },

  chat: {
    /**
     * Fetch history for a lobby
     */
    getHistory: async (hotelId: string): Promise<ChatMessage[]> => {
       await delay(100);
       return DB.messages[hotelId] || [];
    },

    /**
     * Send a message to the lobby or private chat
     * In production: supabase.from('messages').insert(...)
     */
    sendMessage: async (hotelId: string, text: string, user: User, isPrivate = false, image?: string): Promise<ChatMessage> => {
      await delay(200);
      
      const newMessage: ChatMessage = {
        id: Date.now().toString() + Math.random().toString().slice(2, 5),
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        text,
        image,
        timestamp: Date.now()
      };

      // Persist in mock DB only if it's a public lobby message
      if (!isPrivate) {
        if (!DB.messages[hotelId]) {
          DB.messages[hotelId] = [];
        }
        DB.messages[hotelId].push(newMessage);
      }

      return newMessage;
    }
  },

  nudge: {
    /**
     * Send a "Nudge" (Invitation to chat)
     */
    sendNudge: async (fromUserId: string, toUserId: string): Promise<Nudge> => {
      await delay(300);
      
      // Check for existing
      const existing = DB.nudges.find(n => 
        (n.fromUserId === fromUserId && n.toUserId === toUserId) ||
        (n.fromUserId === toUserId && n.toUserId === fromUserId)
      );

      if (existing) return existing;

      const newNudge: Nudge = {
        id: `nudge_${Date.now()}`,
        fromUserId,
        toUserId,
        status: 'pending',
        timestamp: Date.now()
      };
      
      DB.nudges.push(newNudge);

      // --- SIMULATION: AUTO-ACCEPT ---
      // If the recipient is a "bot" (from MOCK_DATA), they accept after 3 seconds.
      // This allows the user to test the feature without a real second user.
      const isBot = toUserId.startsWith('u'); // MOCK_DATA users have IDs like 'u1', 'u2'
      if (isBot) {
        setTimeout(() => {
          const nudgeToUpdate = DB.nudges.find(n => n.id === newNudge.id);
          if (nudgeToUpdate) {
            nudgeToUpdate.status = 'accepted';
          }
        }, 4000);
      }

      return newNudge;
    },

    /**
     * Get all nudges involving a specific user
     */
    getNudges: async (userId: string): Promise<Nudge[]> => {
      await delay(200);
      return DB.nudges.filter(n => n.fromUserId === userId || n.toUserId === userId);
    },

    /**
     * Accept or Reject a nudge
     */
    respondToNudge: async (nudgeId: string, status: 'accepted' | 'rejected'): Promise<Nudge | null> => {
      await delay(300);
      const nudge = DB.nudges.find(n => n.id === nudgeId);
      if (nudge) {
        nudge.status = status;
        return nudge;
      }
      return null;
    }
  }
};