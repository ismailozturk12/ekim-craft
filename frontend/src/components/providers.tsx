"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/ekim/cookie-banner";
import { useAuth, useAuthHydrated } from "@/store/auth";
import { useWishlist } from "@/store/wishlist";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="default"
        themes={["default", "ink", "petal"]}
        enableSystem={false}
      >
        <WishlistLoader />
        {children}
        <CookieBanner />
        <Toaster position="bottom-center" richColors closeButton />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}

function WishlistLoader() {
  const hydrated = useAuthHydrated();
  const user = useAuth((s) => s.user);
  const load = useWishlist((s) => s.load);
  const clear = useWishlist((s) => s.clear);

  useEffect(() => {
    if (!hydrated) return;
    if (user) load();
    else clear();
  }, [hydrated, user, load, clear]);

  return null;
}
