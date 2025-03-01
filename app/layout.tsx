import type { Metadata } from "next";
import "./globals.css";
import { VT323 } from "next/font/google";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Lumon - MDR",
  description: "Macro Data Refinement | Praise Kier",
};

const font = VT323({
  subsets: ["latin"],
  weight: "400",
});

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout(props: LayoutProps) {
  return (
    <html lang="en" className={font.className} suppressHydrationWarning>
      <body className="antialiased">
        <main className="min-h-screen">{props.children}</main>
      </body>
    </html>
  );
}
