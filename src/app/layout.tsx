import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  icons: { icon: "/LogoBlack.png" },
  title: "Emory Woods Apartments | Decatur, Georgia",
  description:
    "A 24-acre wooded sanctuary near Emory University. Luxury apartment living in Decatur, GA, surrounded by nature, minutes from everything.",
  keywords:
    "Emory Woods, apartments, Decatur GA, luxury apartments, Emory University, 24-acre, wooded, residential",
  openGraph: {
    title: "Emory Woods Apartments | Decatur, Georgia",
    description:
      "A 24-acre wooded sanctuary near Emory University. Luxury apartment living in Decatur, GA.",
    url: "https://www.emorywoods.com",
    siteName: "Emory Woods Apartments",
    images: [
      {
        url: "https://lirp.cdn-website.com/6cfb94ae/dms3rep/multi/opt/Emory_4-1920w.jpg",
        width: 1920,
        alt: "Emory Woods Apartments exterior surrounded by mature forest",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Emory Woods Apartments | Decatur, Georgia",
    description:
      "A 24-acre wooded sanctuary near Emory University. Luxury apartment living in Decatur, GA.",
    images: [
      "https://lirp.cdn-website.com/6cfb94ae/dms3rep/multi/opt/Emory_4-1920w.jpg",
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D1A12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${montserrat.variable}`}
    >
      <body>
        <ThemeProvider>
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
