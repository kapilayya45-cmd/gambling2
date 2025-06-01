import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function HomeTest() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Head>
        <title>Home Test Page</title>
      </Head>
      <h1 className="text-3xl font-bold mb-4">Home Test Page</h1>
      <p className="mb-4">This is a test page to verify routing is working properly</p>
      <div className="flex space-x-4">
        <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded">
          Go to Index
        </Link>
        <Link href="/home" className="px-4 py-2 bg-green-500 text-white rounded">
          Go to Home
        </Link>
      </div>
    </div>
  );
} 