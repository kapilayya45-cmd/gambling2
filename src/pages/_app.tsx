import '@/styles/globals.css';
import '@/styles/custom.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { BetSlipProvider } from '@/contexts/BetSlipContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

// Wrapper component that has access to auth context
function AppContent({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WalletProvider>
          <BetSlipProvider>
            <AdminProvider>
              <AppContent>
                <Component {...pageProps} />
              </AppContent>
            </AdminProvider>
          </BetSlipProvider>
        </WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
} 