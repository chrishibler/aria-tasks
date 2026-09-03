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
    // The pre-paint script below sets data-sidebar-hidden on this element, so
    // the DOM React hydrates against differs from the HTML the server sent.
    // That difference is the point — suppress the warning for this element's
    // own attributes (it does not apply to any descendant).
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", nunito.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* Runs before paint so the sidebar starts in the right state. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('aria-sidebar-hidden')==='true')document.documentElement.dataset.sidebarHidden='true'}catch(e){}",
          }}
        />
        <ServiceWorkerRegistrar />
        <ConfirmProvider>{children}</ConfirmProvider>
      </body>
    </html>
  );
}
