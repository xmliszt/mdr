import "@/app/globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { VT323 } from "next/font/google";

const font = VT323({
  weight: "400",
  subsets: ["latin"],
});

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
      <body className={font.className}>
        <main className="min-h-screen">{props.children}</main>
        <Analytics />
      </body>
    </html>
  );
}
