import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import { ToastContainer } from "../components/Toast";
import PageTransition from "../components/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SteelSense AI War Room",
  description: "Industrial Predictive Maintenance Copilot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${jetBrainsMono.variable} antialiased bg-[#0a0b0d] text-white flex h-screen overflow-hidden`}>
        <Sidebar />
        <div className="flex-1 overflow-y-auto relative pl-16 md:pl-20 lg:pl-24">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
        <ToastContainer />
      </body>
    </html>
  );
}
