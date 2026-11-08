import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Common Ground — A world built together",
  description:
    "A calm cooperative robot expedition. Practise everyday conversations, share responsibilities, and restore a world with your team.",
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
