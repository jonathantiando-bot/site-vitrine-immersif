import type { Metadata, Viewport } from "next";
import { display, body } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEVVERSE ENERGY — Unleash your energy",
  description:
    "DEVVERSE ENERGY : une expérience interactive immersive. Noir profond, violet électrique, bleu lumineux. L'énergie a un nouveau nom.",
  openGraph: {
    title: "DEVVERSE ENERGY",
    description: "L'énergie a un nouveau nom.",
    images: ["/images/devverse-reference.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#050509",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
