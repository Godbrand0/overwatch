import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/components/Providers";
import { GlobalNavbar } from "@/components/layout/GlobalNavbar";
import Marquee from "@/components/ui/Marquee";

export const metadata: Metadata = {
  title: "Overwatch - Institutional RWA Gateway",
  description: "Mission Control for Real-World Assets on Mantle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <GlobalNavbar />
          <Marquee />
          {children}
        </Providers>
      </body>
    </html>
  );
}
