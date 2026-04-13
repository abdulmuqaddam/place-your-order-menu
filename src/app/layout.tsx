import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Order Verse",
  description: "Order your favourite food online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#121212] text-white">
        {children}
      </body>
    </html>
  );
}
