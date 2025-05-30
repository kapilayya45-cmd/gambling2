import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectAuth } from '@/contexts/DirectAuthContext';
import { useRouter } from 'next/router';

interface SuperadminCheckProps {
  children: React.ReactNode;
}

export default function SuperadminCheck({ children }: SuperadminCheckProps) {
  const { currentUser, isAdmin, isSuperadmin, loading } = useAuth();
  const { directAuth, hasDirectAuth } = useDirectAuth();
  const router = useRouter();

  // Either regular auth as superadmin or direct auth
  const isAuthorized = (!loading && isSuperadmin) || hasDirectAuth;
  
  // Redirect to direct login if there's an auth network error
  useEffect(() => {
    // Listen for specific error in console
    const errorListener = (event: ErrorEvent) => {
      if (event.error?.message?.includes('auth/network-request-failed')) {
        console.log('Detected network auth error, suggesting direct login');
        
        // Check if we're already on the direct login page
        if (router.pathname !== '/superadmin-direct-login') {
          // Show a message to the user
          const useDirectLogin = window.confirm(
            'Network authentication error detected. Would you like to use the direct superadmin login instead?'
          );
          
          if (useDirectLogin) {
            router.push('/superadmin-direct-login');
          }
        }
      }
    };
    
    window.addEventListener('error', errorListener);
    return () => window.removeEventListener('error', errorListener);
  }, [router]);
  
  // Show loading state while checking auth
  if (loading && !hasDirectAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Not authorized: redirect or show error
  if (!isAuthorized) {
    // If we're not on the direct login page, offer to go there
    if (router.pathname !== '/superadmin-direct-login') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-red-900 bg-opacity-20 p-8 rounded-lg max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
            <p className="text-white mb-6">
              You need superadmin permissions to access this page.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => router.push('/superadmin-direct-login')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
              >
                Use Direct Superadmin Login
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 w-full"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
  
  // Authorized, show children
  return <>{children}</>;
} 