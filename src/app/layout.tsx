import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social — твоя соцсеть",
  description: "Современная социальная сеть с мощным мессенджером",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}