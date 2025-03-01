import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumon - MDR",
  description: "Macro Data Refinement | Praise Kier",
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout(props: LayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <main className="min-h-screen">{props.children}</main>
      </body>
    </html>
  );
}
