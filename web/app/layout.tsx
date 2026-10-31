import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body-face", display: "swap" });
const display = Inter_Tight({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display-face", display: "swap" });

export const metadata: Metadata = {
  title: "Handshake",
  description:
    "When something breaks between two companies, each one's AI agent checks its own side in a shared chat, finds whose bug it is and fixes it in a pull request. No code changes hands.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
