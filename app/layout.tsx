import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Best Friend's Closet",
  description: "Shop and consign at My Best Friend's Closet in Tracy, California."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
