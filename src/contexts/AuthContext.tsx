
import { set } from 'date-fns';
import React, { createContext, useState, useEffect, ReactNode } from 'react';

const API_URL = import.meta.env.VITE_BACKEND_API_URL_START;

export interface User {
  name: string;
  email: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    const response = await fetch(API_URL + '/authentication/get_user', {
      method: 'GET',
      credentials: 'include',
    })
    const data = await response.json();
    if (response.status === 200) {
      setUser({'name': data.name, 'email': data.email});
      setIsLoading(false);
    } else {
      console.error('Error fetching user:', response.statusText);
      setUser(null);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const initializeUser = async () => {
      await fetchUser();
    };

    initializeUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await fetch(API_URL + '/authentication/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });
    
    if (!response.ok) {
      if (response.status === 500) {
        setIsLoading(false);
        throw new Error('Please check your internet connection and try again.');
      }
      const err = await response.json();
      setIsLoading(false);
      throw new Error(err.error);
    }
    
    await fetchUser();
    
    window.dispatchEvent(new Event('Logged In'));
    setIsLoading(false);
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL + '/authentication/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      });
      
      if (!response.ok) {
        if (response.status === 500) {
          setIsLoading(false);
          throw new Error('Please check your internet connection and try again.');
        }
        const err = await response.json();
        setIsLoading(false);
        throw new Error(err.error);
      }
      
      await fetchUser();
      
      window.dispatchEvent(new Event('Signed Up'));
    } catch (err) {
      console.error('Signup error:', err);
      throw new Error('Invalid credentials');
    }
    finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const response = await fetch(API_URL + '/authentication/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: user.email,
      }),
    });
    if (!response.ok) {
      if (response.status === 500) {
        setIsLoading(false);
        throw new Error('Please check your internet connection and try again.');
      }
      const err = await response.json();
      setIsLoading(false);
      throw new Error(err.error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
