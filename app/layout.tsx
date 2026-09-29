import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RiceWalk — Experience life at Rice",
  description: "Choose a residential college and experience the walks and everyday moments that make Rice feel like home.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
