import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PulseReader",
  description: "A focused RSS reader for staying on top of your feeds."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
