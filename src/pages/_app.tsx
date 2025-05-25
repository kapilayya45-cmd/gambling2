import '@/styles/globals.css';
import '@/styles/custom.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { BetSlipProvider } from '@/contexts/BetSlipContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WalletProvider>
          <BetSlipProvider>
            <AdminProvider>
              <Component {...pageProps} />
            </AdminProvider>
          </BetSlipProvider>
        </WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
} 