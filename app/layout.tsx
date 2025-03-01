import type { Metadata } from "next";
import "@/app/globals.css";

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
      </body>
    </html>
  );
}
