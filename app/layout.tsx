import { StartupLoadingOverlay } from "@/app/components/startup-loading-overlay";
import "@/app/globals.css";
import { HelloMsCobelScreenSaverControllerComponent } from "@/app/hello-ms-cobel-screen-saver-controller";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work at Lumon | Macro Data Refinement",
  description:
    "Join Lumon Industries for Macro Data Refinement opportunities. Experience the balance of work and purpose. Praise Kier.",
  keywords:
    "Lumon Industries, Macro Data Refinement, Severance, Jobs, Career, Kier Eagan",
  authors: [{ name: "Li Yuxuan" }],
  creator: "Li Yuxuan",
  publisher: "Li Yuxuan",
  applicationName: "Lumon Industries - Macro Data Refinement",
  robots: "index, follow",
  themeColor: "#0a1a3d",
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "Work at Lumon | Macro Data Refinement",
    description:
      "Join Lumon Industries for Macro Data Refinement opportunities. Experience the balance of work and purpose. Praise Kier.",
    url: "https://lumon-industries.work",
    siteName: "Lumon Industries",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 2560,
        height: 1440,
        alt: "Lumon Industries",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Work at Lumon | Macro Data Refinement",
    description:
      "Join Lumon Industries for Macro Data Refinement opportunities. Experience the balance of work and purpose.",
    creator: "@xmliszt",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://lumon-industries.work",
  },
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout(props: LayoutProps) {
  return (
    <html lang="en" className="w-full h-full" suppressHydrationWarning>
      <body className="antialiased w-full h-full">
        <main className="w-full h-full">{props.children}</main>
        <StartupLoadingOverlay />
        <Analytics />
        <HelloMsCobelScreenSaverControllerComponent />
      </body>
    </html>
  );
}
