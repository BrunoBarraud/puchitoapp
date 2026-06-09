import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { PwaRegister } from "@/components/pwa/pwa-register";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "Puchito App",
  description: "App para controlar esos gastos chicos que te funden.",
  applicationName: "Puchito App",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Puchito App"
  },
  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/png"
      }
    ],
    apple: [
      {
        url: "/favicon.png",
        type: "image/png"
      }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: "#2f2118"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${plusJakartaSans.variable} ${fraunces.variable} font-sans`}>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
