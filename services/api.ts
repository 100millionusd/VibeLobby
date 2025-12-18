import { ScoredHotel, User, ChatMessage, Nudge } from '../types';
import { getHotelsByActivity } from './vibeAlgorithm';
import { MOCK_BOOKINGS, USERS } from './mockData';
import { supabase } from './supabaseClient';

// Helper to simulate network latency (optional now, but good for UX feel)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * PRODUCTION READY API LAYER
 * 
 * Now integrated with Supabase for persistence.
 */
export const api = {

  auth: {
    getSession: async (): Promise<User | null> => {
      const stored = localStorage.getItem('vibe_user');
      if (stored) {
        const user = JSON.parse(stored);
        // Ensure user exists in Supabase (Sync legacy local users to DB)
        const { error } = await supabase.from('users').upsert({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          bio: user.bio
        });

        if (error) {
          console.error("Failed to sync user to Supabase:", error);
          // We don't block login, but chat might fail.
        }
        return user;
      }
      return null;
    },

    loginAsGuest: async (): Promise<User> => {
      const guestUser: User = {
        id: `guest_${Date.now()}`,
        name: 'Guest Explorer',
        avatar: 'https://i.pravatar.cc/150?u=me_guest',
        bio: 'Just vibing',
        isGuest: true,
        digitalKeys: []
      };

      // Sync guest to Supabase Users table
      await supabase.from('users').upsert({
        id: guestUser.id,
        name: guestUser.name,
        avatar: guestUser.avatar,
        bio: guestUser.bio
      });

      localStorage.setItem('vibe_user', JSON.stringify(guestUser));
      return guestUser;
    },

    logout: async () => {
      localStorage.removeItem('vibe_user');
    },

    updateProfile: async (userId: string, updates: { name?: string; bio?: string; avatar?: string }) => {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error("Failed to update profile:", error);
        throw error;
      }
    }
  },

  hotels: {
    search: async (interest: string, city: string): Promise<ScoredHotel[]> => {
      // Keep using local algorithm for now (Phase 1)
      await delay(600);
      return getHotelsByActivity(interest, city);
    },

    getGuests: async (hotelId: string, interest: string): Promise<User[]> => {
      // Keep using mock bookings for now (Phase 1)
      await delay(300);
      if (hotelId.startsWith('dyn_')) return [];

      const bookings = MOCK_BOOKINGS.filter(
        b => b.hotelId === hotelId && b.primaryInterest === interest
      );

      const relevantUsers = bookings
        .map(b => USERS.find(u => u.id === b.userId))
        .filter((u): u is User => !!u);

      return Array.from(new Set(relevantUsers.map(u => u.id)))
        .map(id => relevantUsers.find(u => u.id === id)!);
    }
  },

  chat: {
    getHistory: async (hotelId: string): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('is_private', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching chat:", error);
        return [];
      }

      return data.map((m: any) => ({
        id: m.id,
        userId: m.user_id,
        userName: m.user_name,
        userAvatar: m.user_avatar,
        text: m.text,
        image: m.image,
        timestamp: new Date(m.created_at).getTime(),
        isAi: false
      }));
    },

    getPrivateHistory: async (userId: string, otherUserId: string): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('is_private', true)
        .or(`and(user_id.eq.${userId},recipient_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching private chat:", error);
        return [];
      }

      return data.map((m: any) => ({
        id: m.id,
        userId: m.user_id,
        userName: m.user_name,
        userAvatar: m.user_avatar,
        text: m.text,
        image: m.image,
        timestamp: new Date(m.created_at).getTime(),
        isAi: false
      }));
    },

    sendMessage: async (hotelId: string, text: string, user: User, isPrivate = false, image?: string, recipientId?: string): Promise<ChatMessage> => {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId,
          text,
          user,
          isPrivate,
          image,
          recipientId
        })
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("Error sending message:", err);
        throw new Error(err.error || "Failed to send message");
      }

      const data = await response.json();

      return {
        id: data.id,
        userId: data.user_id,
        userName: data.user_name,
        userAvatar: data.user_avatar,
        text: data.text,
        image: data.image,
        timestamp: new Date(data.created_at).getTime(),
        isAi: false
      };
    },

    subscribeToPush: async (subscription: any, userId: string) => {
      await fetch('/api/chat/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, userId })
      });
    },

    getRecentContacts: async (currentUserId: string): Promise<User[]> => {
      // 1. Get all private messages involving me
      const { data: messages, error } = await supabase
        .from('messages')
        .select('user_id, recipient_id')
        .eq('is_private', true)
        .or(`user_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`);

      if (error || !messages) return [];

      // 2. Extract unique other user IDs
      const contactIds = new Set<string>();
      messages.forEach((m: any) => {
        if (m.user_id !== currentUserId) contactIds.add(m.user_id);
        if (m.recipient_id !== currentUserId) contactIds.add(m.recipient_id);
      });

      if (contactIds.size === 0) return [];

      // 3. Fetch user details
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .in('id', Array.from(contactIds));

      if (userError || !users) return [];

      return users.map((u: any) => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        bio: u.bio,
        digitalKeys: [],
        isGuest: false
      }));
    }

  },

  nudge: {
    sendNudge: async (fromUserId: string, toUserId: string): Promise<Nudge> => {
      const response = await fetch('/api/chat/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId, toUserId })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to send nudge");
      }

      const data = await response.json();

      return {
        id: data.id,
        fromUserId: data.from_user_id,
        toUserId: data.to_user_id,
        status: data.status,
        timestamp: new Date(data.created_at).getTime()
      };
    },

    getNudges: async (userId: string): Promise<Nudge[]> => {
      const { data, error } = await supabase
        .from('nudges')
        .select('*')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);

      if (error) {
        console.error("Error fetching nudges:", error);
        return [];
      }

      return data.map((n: any) => ({
        id: n.id,
        fromUserId: n.from_user_id,
        toUserId: n.to_user_id,
        status: n.status,
        timestamp: new Date(n.created_at).getTime()
      }));
    },

    respondToNudge: async (nudgeId: string, status: 'accepted' | 'rejected'): Promise<Nudge | null> => {
      const { data, error } = await supabase
        .from('nudges')
        .update({ status })
        .eq('id', nudgeId)
        .select()
        .single();

      if (error) return null;

      return {
        id: data.id,
        fromUserId: data.from_user_id,
        toUserId: data.to_user_id,
        status: data.status,
        timestamp: new Date(data.created_at).getTime()
      };
    }
  }
};