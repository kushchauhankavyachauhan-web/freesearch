import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RentAWeb — Website Rental for Indian Small Businesses",
  description: "Rent or buy a professional website for your gym, salon, clinic, store, tuition centre or restaurant. Plans from ₹1,500/month.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0A0A0F] text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
          <p>© 2024 RentAWeb. Built for Indian small businesses.</p>
        </footer>
      </body>
    </html>
  );
}
