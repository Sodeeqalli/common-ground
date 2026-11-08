import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Common Ground",
  description:
    "A cooperative robot game. Complete missions to build your shared world.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
