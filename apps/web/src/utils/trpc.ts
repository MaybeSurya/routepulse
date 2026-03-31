import type { AppRouter } from "@route-pulse/api/routers/index";

import { env } from "@route-pulse/env/web";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, TRPCClientError } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { showErrorToast } from "./toast";

import { useAuthStore } from "@/store/auth";

// ─── Silent Token Refresh ─────────────────────────────────────────────────────
// Holds a single in-flight refresh promise so concurrent failures don't
// trigger multiple refresh calls simultaneously.
let refreshPromise: Promise<string | null> | null = null;

async function silentRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const { refreshToken, logout, setAccessToken } = useAuthStore.getState();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/trpc/auth.refreshToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "0": { json: { refreshToken } } }),
      });

      const json = await res.json();
      const data = json?.[0]?.result?.data?.json?.data;

      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        // Also update the refreshToken in store if a new one was issued
        if (data.refreshToken) {
          useAuthStore.setState({ refreshToken: data.refreshToken });
        }
        return data.accessToken;
      }
    } catch {
      // Network error - don't log out, just return null to retry later
    }

    // Refresh token is invalid or revoked — force logout
    logout();
    return null;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

// ─── Error Filter ─────────────────────────────────────────────────────────────
// These error codes are handled by the auth flow — don't show generic toasts.
const SILENT_ERROR_CODES = ["UNAUTHORIZED", "FORBIDDEN"];

function isSilentError(error: unknown): boolean {
  if (error instanceof TRPCClientError) {
    return SILENT_ERROR_CODES.includes(error.data?.code);
  }
  return false;
}

// ─── Query Client ─────────────────────────────────────────────────────────────
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Don't show toasts for auth errors — silentRefresh handles those
      if (isSilentError(error)) return;
      showErrorToast(error.message);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (isSilentError(error)) return;
      // Mutations show their own onError handlers — not needed here
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry auth errors — let the link-level interceptor handle refresh
        if (isSilentError(error)) return false;
        return failureCount < 1;
      },
    },
  },
});

// ─── TRPC Client ─────────────────────────────────────────────────────────────
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.NEXT_PUBLIC_SERVER_URL}/trpc`,
      headers() {
        const token = useAuthStore.getState().accessToken;
        return {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
      },
      fetch: async (url, options) => {
        let response = await fetch(url, options);

        // If we get a 401-equivalent from the batch, attempt silent refresh
        if (response.status === 200) {
          const clone = response.clone();
          const json = await clone.json().catch(() => null);
          const hasUnauth = Array.isArray(json) && json.some(
            (item: any) => item?.error?.data?.code === "UNAUTHORIZED"
          );

          if (hasUnauth) {
            const newToken = await silentRefresh();
            if (newToken) {
              // Retry the original request with the new token
              const newHeaders = new Headers(options?.headers);
              newHeaders.set("Authorization", `Bearer ${newToken}`);
              response = await fetch(url, { ...options, headers: newHeaders });
            }
          }
        }

        return response;
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
