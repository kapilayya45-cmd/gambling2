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
import { Inter } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CoinsProvider } from '@/contexts/CoinsContext';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

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
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      </Head>
      <AuthProvider>
        <WalletProvider>
          <CoinsProvider>
            <BetSlipProvider>
              <AdminProvider>
                <AppContent>
                  <main className={inter.className}>
                    <ToastContainer
                      position="top-right"
                      autoClose={5000}
                      hideProgressBar={false}
                      newestOnTop
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                    />
                    <Component {...pageProps} />
                  </main>
                </AppContent>
              </AdminProvider>
            </BetSlipProvider>
          </CoinsProvider>
        </WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
} 