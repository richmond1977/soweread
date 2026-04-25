import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "潤讀 So We Read",
  description: "以食品安全、營養知識與飲食文化為核心的內容發表平台。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
