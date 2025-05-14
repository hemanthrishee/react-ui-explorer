
import { set } from 'date-fns';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '@/types/user';

const API_URL = import.meta.env.VITE_BACKEND_API_URL_START;

export interface User {
  name: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
  qualifications?: string;
  expertise?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    qualifications?: string,
    expertise?: string
  ) => Promise<void>;
  logout: () => void;
  updateUserRole: (role: UserRole) => void;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async (
    _name: string,
    _email: string,
    _password: string,
    _role: UserRole,
    _qualifications?: string,
    _expertise?: string
  ) => {},
  logout: () => {},
  updateUserRole: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await fetch(API_URL + '/authentication/get_user', {
        method: 'GET',
        credentials: 'include',
      })
      const data = await response.json();
      if (response.status === 200) {
        // Check if we have a saved role in localStorage
        const savedRole = localStorage.getItem('userRole');
        
        setUser({
          'name': data.name, 
          'email': data.email,
          'role': data.role, // Use saved role or default to student
          'profilePicture': data.profilePicture,
          'qualifications': data.qualifications,
          'expertise': data.expertise
        });
        setIsLoading(false);
      } else {
        console.error('Error fetching user:', response.statusText);
        setUser(null);
        setIsLoading(false);
      }
    } catch (err) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setIsLoading(false);
        throw new Error('No internet connection. Please check your connection.');
      }
      setIsLoading(false);
      throw new Error('Failed to fetch user data. Please try again later.');
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
    try {
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
    } catch (err) {
      window.dispatchEvent(new Event('Log in failed'));
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setIsLoading(false);
        throw new Error('No internet connection. Please check your connection.');
      }
      throw new Error(err.message);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole = 'student',
    qualifications?: string,
    expertise?: string
  ) => {
    setIsLoading(true);
    try {
      // Save the role to localStorage for UI purposes
      localStorage.setItem('userRole', role);
      const signupBody: any = {
        name: name,
        email: email,
        password: password,
        role: role,
      };
      if (role === 'teacher') {
        signupBody.qualifications = qualifications;
        signupBody.expertise = expertise;
      }
      const response = await fetch(API_URL + '/authentication/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(signupBody),
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
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setIsLoading(false);
        throw new Error('No internet connection. Please check your connection.');
      }
      console.error('Signup error:', err);
      setIsLoading(false);
      throw new Error('Invalid credentials');
    }
    finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = (role: UserRole) => {
    if (user) {
      // Save the role to localStorage
      localStorage.setItem('userRole', role);
      
      // Update the user object
      setUser({
        ...user,
        role
      });
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(API_URL + '/authentication/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: user?.email,
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
      
      // Clear the role from localStorage
      localStorage.removeItem('userRole');
      
      setUser(null);
    } catch (err) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setIsLoading(false);
        throw new Error('No internet connection. Please check your connection.');
      }
      throw new Error(err.message);
    }
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
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
