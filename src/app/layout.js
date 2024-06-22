import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "3djs",
  description: "Entwickelt von Ensar Korkmaz",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
