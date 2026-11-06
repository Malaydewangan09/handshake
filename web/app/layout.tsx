import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body-face", display: "swap" });
const display = Inter_Tight({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display-face", display: "swap" });

export const metadata: Metadata = {
  title: "Handshake",
  description:
    "Two companies blaming each other for a bug, or two flatmates arguing over a bills sheet. Each side's AI agent checks only its own records in one shared chat, and both end up agreeing whose mistake it was.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
