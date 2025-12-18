import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, BookingConfirmationResponse, DigitalKey } from '../types';
import { web3auth, initWeb3Auth } from '../services/web3AuthService';
import { api } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper: Check for expired keys
  const checkExpiredKeys = (currentUser: User): User | null => {
    if (!currentUser.digitalKeys || currentUser.digitalKeys.length === 0) return null;
    const now = new Date();
    let hasChanges = false;
    const updatedKeys = currentUser.digitalKeys.map(key => {
      if (key.status === 'expired') return key;
      const checkOutDate = new Date(key.checkOut);
      if (now > checkOutDate) {
        hasChanges = true;
        return { ...key, status: 'expired' as const };
      }
      return key;
    });
    if (hasChanges) {
      return { ...currentUser, digitalKeys: updatedKeys };
    }
    return null;
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await initWeb3Auth();

        if (web3auth.connected) {
          await processLogin();
        } else {
          // Attempt to load from local storage if Web3Auth not active but we have a session
          // OR we just stay logged out.
          const stored = localStorage.getItem('vibe_user');
          if (stored) {
            const currentUser = JSON.parse(stored);
            // Only restore if it's NOT a guest user (since user requested removal of guest mode)
            if (!currentUser.isGuest) {
              setUser(checkExpiredKeys(currentUser) || currentUser);
            } else {
              // Clean up stale guest session
              localStorage.removeItem('vibe_user');
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization failed', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const processLogin = async () => {
    if (!web3auth.provider) return;

    try {
      // 1. Get User Info from Web3Auth (Social data)
      const userInfo = await web3auth.getUserInfo();

      // 2. Get Wallet Address
      // For EIP155 (Ethereum), we request accounts via RPC
      const accounts = (await web3auth.provider.request({ method: "eth_accounts" })) as string[];
      const address = accounts && accounts.length > 0 ? accounts[0] : undefined;

      // 3. Sync with Local Storage for Digital Keys persistence
      // In a real app, we would fetch keys from the backend DB using the wallet address
      const stored = localStorage.getItem('vibe_user');
      let existingKeys: DigitalKey[] = [];
      if (stored) {
        const storedUser = JSON.parse(stored);
        // Only merge keys if the ID matches to prevent leaking keys between accounts
        if (storedUser.id === (userInfo.verifierId || address)) {
          existingKeys = storedUser.digitalKeys || [];
        }
      }

      // 4. Construct User Object
      const newUser: User = {
        id: userInfo.verifierId || address || 'unknown_user',
        name: userInfo.name || 'Anonymous Vibe',
        email: userInfo.email,
        avatar: userInfo.profileImage || `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
        bio: 'Just vibing on-chain',
        walletAddress: address,
        verifier: userInfo.verifier,
        isGuest: false,
        digitalKeys: existingKeys
      };

      const checkedUser = checkExpiredKeys(newUser) || newUser;
      setUser(checkedUser);
      localStorage.setItem('vibe_user', JSON.stringify(checkedUser));

    } catch (e) {
      console.error("Login Processing Error:", e);
    }
  };

  const login = async () => {
    if (!web3auth || web3auth.status === 'not_ready') {
      console.error("Web3Auth not initialized");
      return;
    }

    try {
      await web3auth.connect();
      if (web3auth.connected) {
        await processLogin();
      }
    } catch (error) {
      console.error("Web3Auth Login Error:", error);
    }
  };

  const logout = async () => {
    try {
      if (web3auth && web3auth.connected) {
        await web3auth.logout();
      }
    } catch (error) {
      console.error("Web3Auth logout failed (non-fatal):", error);
    } finally {
      // Always clear local state
      setUser(null);
      localStorage.removeItem('vibe_user');
    }
  };

  const grantDigitalKey = (confirmation: BookingConfirmationResponse) => {
    if (!user) return;
    const { data } = confirmation;
    const { lobby_access, hotel, dates, booking_reference } = data;

    if (!lobby_access.granted) return;

    const existingKeyIndex = user.digitalKeys.findIndex(k => k.hotelId === hotel.id && k.bookingReference === booking_reference);
    if (existingKeyIndex >= 0) return;

    const newKey: DigitalKey = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomType: data.room.name,
      checkIn: dates.check_in,
      checkOut: dates.check_out,
      bookingReference: booking_reference,
      status: 'active'
    };

    // Promote guest to verified user so session persists
    const updatedUser = {
      ...user,
      isGuest: false,
      digitalKeys: [...user.digitalKeys, newKey]
    };
    setUser(updatedUser);
    localStorage.setItem('vibe_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      grantDigitalKey
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};