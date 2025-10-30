"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { getProfile } from "@/lib/http/api";
import { useAuthStore } from "@/store";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const setUser = useAuthStore((s) => s.setUser);
  const setUserData = useAuthStore((s) => s.setUserData);

  // On client boot, attempt to rehydrate auth from server using HTTP-only cookies.
  // This calls GET /api/auth/me which relies on cookies being sent by the browser.
  useEffect(() => {
    let mounted = true;

    const rehydrate = async () => {
      try {
        const res = await getProfile();
        if (!mounted) return;
        const user = res?.data;
        if (user) {
          // minimal user info for quick checks
          setUser({ role: user.role, email: user.email });
          setUserData(user);
        }
      } catch (err) {
        // If request fails (no valid session), clear any stale client-side auth
        if (!mounted) return;
        setUser(null);
        setUserData(null);
      }
    };

    rehydrate();

    return () => {
      mounted = false;
    };
  }, [setUser, setUserData]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* todo to enable devtools of react query  */}
      {/* {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )} */}
    </QueryClientProvider>
  );
}
