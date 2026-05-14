import type { Metadata } from "next";
import { Nunito, DM_Sans } from "next/font/google";
import "@/app/globals.css";
import { AppShell } from "@/components/layout/app-shell";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito"
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm"
});

export const metadata: Metadata = {
  title: "Foodie Plog AI",
  description: "Warm lifestyle foodie check-in prototype"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${nunito.variable} ${dmSans.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

