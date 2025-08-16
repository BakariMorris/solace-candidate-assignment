import type { Metadata } from "next";
import { Spectral, Roboto } from "next/font/google";
import "./globals.css";
import QueryProvider from "./providers/QueryProvider";
import ErrorBoundary from "../components/ErrorBoundary";
import { ThemeProvider } from "../components/theme-provider";

const spectral = Spectral({ 
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-spectral"
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-roboto"
});

export const metadata: Metadata = {
  title: "Solace Candidate Assignment",
  description: "Show us what you got",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spectral.variable} ${roboto.variable} ${spectral.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
