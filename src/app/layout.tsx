import type { Metadata, Viewport } from "next";
import { Nunito, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ConfirmProvider } from "@/components/confirm-provider";
import { ServiceWorkerRegistrar } from "@/components/service-worker-registrar";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Aria's Tasks",
  description: "Aria's task and reward tracker",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", nunito.variable, "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col font-sans">
        <ServiceWorkerRegistrar />
        <ConfirmProvider>{children}</ConfirmProvider>
      </body>
    </html>
  );
}
