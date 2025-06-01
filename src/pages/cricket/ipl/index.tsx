import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Simple redirect page to the betting options
export default function IPLRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to betting page
    router.replace('/cricket/ipl/bet');
  }, [router]);
  
  return (
    <>
      <Head>
        <title>Redirecting to IPL Betting</title>
      </Head>
      <div className="flex items-center justify-center h-screen">
        <p>Redirecting to IPL betting page...</p>
      </div>
    </>
  );
}

// Using getServerSideProps for immediate server-side redirect
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/cricket/ipl/bet',
      permanent: false,
    },
  };
} 