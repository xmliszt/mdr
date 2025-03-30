import { StartupLoadingOverlay } from "@/app/components/startup-loading-overlay";
import "@/app/globals.css";
import { HelloMsCobelScreenSaverControllerComponent } from "@/app/hello-ms-cobel-screen-saver-controller";
import { METADATA } from "@/app/metadata";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  ...METADATA,
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
        <HelloMsCobelScreenSaverControllerComponent />
        <Analytics />
      </body>
    </html>
  );
}
