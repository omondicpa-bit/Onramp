import type { Metadata } from "next";
import "./globals.css";
import { NavRail } from "./components/NavRail";

export const metadata: Metadata = {
  title: "EPH Onramp",
  description: "Personal crypto collection dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <NavRail />
          <main className="flex-1 px-10 py-8 max-w-4xl">{children}</main>
        </div>
      </body>
    </html>
  );
}
