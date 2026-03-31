import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  erpId: string | null;
  role: "student" | "driver" | "transport_admin" | "super_admin";
  isVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;

  setAuth: (user: AuthUser, accessToken: string, refreshToken: string, rememberMe?: boolean) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken, rememberMe) => {
        if (typeof window !== "undefined" && rememberMe !== undefined) {
          localStorage.setItem("routepulse-remember-me", rememberMe ? "true" : "false");
        }
        set({ user, accessToken, refreshToken });
      },

      setAccessToken: (token) => set({ accessToken: token }),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("routepulse-remember-me");
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: "routepulse-auth",
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          return localStorage.getItem(name) || sessionStorage.getItem(name);
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          const remember = localStorage.getItem("routepulse-remember-me") === "true";
          if (remember) {
            localStorage.setItem(name, value);
            sessionStorage.removeItem(name);
          } else {
            sessionStorage.setItem(name, value);
            localStorage.removeItem(name);
          }
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          localStorage.removeItem(name);
          sessionStorage.removeItem(name);
        },
      })),
    },
  ),
);
