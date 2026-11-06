import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body-face", display: "swap" });
const display = Inter_Tight({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display-face", display: "swap" });

export const metadata: Metadata = {
  title: "Handshake",
  description:
    "Each side's AI agent checks its own records in a shared chat and finds whose mistake it is: a bug between two companies, or a bills sheet between two flatmates. Nobody sees the other's code or records.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
