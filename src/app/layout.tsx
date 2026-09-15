import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "元素之诗 - 收支记录清单",
  description: "以四元素之名，记录生活的每一笔流动。水之收入、火之支出、风之投资、土之储蓄。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
