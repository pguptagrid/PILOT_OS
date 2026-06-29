'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';

interface MockUser {
  id: string;
  username: string;
  name: string;
  email: string;
  imageUrl: string;
  role: string;
}

const ClerkMockContext = createContext<{
  user: MockUser | null;
  isLoaded: boolean;
}>({ user: null, isLoaded: false });

export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Check if user credentials are passed in the URL query string
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get('user_id');
    const urlName = params.get('user_name');
    const urlEmail = params.get('user_email');
    const urlRole = params.get('user_role');

    if (urlId && urlName) {
      const newUser: MockUser = {
        id: urlId,
        username: urlName,
        name: urlName,
        email: urlEmail || '',
        role: urlRole || 'developer',
        imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=' + encodeURIComponent(urlName),
      };
      sessionStorage.setItem('pilot_meeting_user', JSON.stringify(newUser));
      setUser(newUser);
      
      // Clean up query string from URL for clean presentation
      const url = new URL(window.location.href);
      url.searchParams.delete('user_id');
      url.searchParams.delete('user_name');
      url.searchParams.delete('user_email');
      url.searchParams.delete('user_role');
      window.history.replaceState({}, '', url.pathname + url.search);
    } else {
      // 2. Otherwise try loading from sessionStorage
      const stored = sessionStorage.getItem('pilot_meeting_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          sessionStorage.removeItem('pilot_meeting_user');
        }
      } else {
        // Fallback default user if no PILOT session is active
        // Generate a unique random ID and name suffix to avoid Stream participant collision!
        const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const fallbackUser: MockUser = {
          id: `usr_guest_${randSuffix}`,
          username: `Guest_${randSuffix}`,
          name: `Guest User #${randSuffix}`,
          email: `guest_${randSuffix.toLowerCase()}@localhost`,
          role: 'unregistered',
          imageUrl: `https://api.dicebear.com/7.x/lorelei/svg?seed=Guest_${randSuffix}`,
        };
        sessionStorage.setItem('pilot_meeting_user', JSON.stringify(fallbackUser));
        setUser(fallbackUser);
      }
    }
    setIsLoaded(true);
  }, []);

  return (
    <ClerkMockContext.Provider value={{ user, isLoaded }}>
      {children}
    </ClerkMockContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(ClerkMockContext);
  return {
    user: context.user,
    isLoaded: context.isLoaded,
    isSignedIn: !!context.user,
  };
};

export const SignedIn = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded || !isSignedIn) return null;
  return <>{children}</>;
};

export const SignedOut = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded || isSignedIn) return null;
  return <>{children}</>;
};

export const UserButton = () => {
  const { user } = useUser();
  if (!user) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.5rem", background: "#1c1f2e", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
      <img src={user.imageUrl} alt="avatar" style={{ width: 30, height: 30, borderRadius: "50%" }} />
      <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>{user.name}</span>
        <span style={{ fontSize: "0.62rem", color: "#F5A700", textTransform: "uppercase", fontWeight: 800 }}>{user.role}</span>
      </div>
    </div>
  );
};
