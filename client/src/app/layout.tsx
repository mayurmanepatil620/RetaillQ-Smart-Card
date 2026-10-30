import "./globals.css";
import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "RetailIQ", // Shows on the home page
    template: "%s | RetailIQ", // Automatically adds "| RetailIQ" to sub-pages
  },
  description: "Smart retail analytics and management platform",
  icons: {
    // This points directly to the image inside your "public" folder
    icon: "/RetailIQ.png", 
    shortcut: "/RetailIQ.png",
    apple: "/RetailIQ.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-[#2D2A26] bg-[#FFFDF5] flex flex-col overflow-x-hidden font-sans">
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}