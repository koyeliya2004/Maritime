import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "SUB-SENTINEL | Acoustic-Visual Forensics & Threat Relay",
  description:
    "Underwater forensic analysis: image enhancement, threat detection, and AI-generated situational reports.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="bg-panel text-gray-100 font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0e1625",
              color: "#e2e8f0",
              border: "1px solid #1e2d42",
              fontFamily: "var(--font-inter)",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#0e1625" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#0e1625" } },
          }}
        />
      </body>
    </html>
  );
}
