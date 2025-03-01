import "@/app/globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work at Lumon",
  description: "Macro Data Refinement | Work at Lumon | Praise Kier",
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout(props: LayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <main className="min-h-screen">{props.children}</main>
        <Analytics />
      </body>
    </html>
  );
}
