// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Adjust this based on your use case
      retry: 2,
      staleTime: 30000, // Cache data for 30 seconds
    },
  },
});

export default queryClient;
