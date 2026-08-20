import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Muhammad Haerul's Portfolio",
  description: "Feedback and Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-white`}>
        <div className="google-strip fixed top-0 left-0 w-full z-50"></div>
        {children}
      </body>
    </html>
  );
}
