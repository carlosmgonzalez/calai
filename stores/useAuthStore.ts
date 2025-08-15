import { AuthError } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { create } from "zustand";

WebBrowser.maybeCompleteAuthSession();

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  give_name?: string;
  family_name?: string;
  email_verified: boolean;
  provider?: string;
  exp?: number;
  cookieExpiration?: number;
};

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: AuthError | null;
}

interface AuthActions {
  setUser: (user: Partial<AuthUser> | AuthUser) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: AuthError) => void;

  signIn: () => void;
  signOut: () => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  //State
  user: null,
  isLoading: false,
  error: null,

  // Actions
  signIn: () => {},
  signOut: () => {},
  fetchWithAuth: async (url, options) => {},
  setUser: (userData) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, ...userData }
        : (userData as AuthUser),
    })),
  setIsLoading: (isLoading) =>
    set(() => ({
      isLoading,
    })),
  setError: (error) =>
    set(() => ({
      error,
    })),
}));
