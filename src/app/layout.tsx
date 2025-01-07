import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub Profile",
  description: "Remake of the GitHub profile page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'Segoe UI', sans-serif" }} className="antialiased">
        {children}
      </body>
    </html>
  );
}
