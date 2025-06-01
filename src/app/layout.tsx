import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { BetSlipProvider } from "@/contexts/BetSlipContext";
import { AdminProvider } from "@/contexts/AdminContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Betting Platform",
  description: "A modern sports betting platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <AuthProvider>
          <AdminProvider>
            <WalletProvider>
              <BetSlipProvider>
                {children}
              </BetSlipProvider>
            </WalletProvider>
          </AdminProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
