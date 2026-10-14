import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { APP_NAME, TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${APP_NAME} - ${TAGLINE}`,
  description: "Verify official announcements and prevent campus misinformation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-navy-900">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
