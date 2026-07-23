import { Geist, Geist_Mono } from "next/font/google";
import "./app.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Slate',
  description: 'AI-powered weekly planner',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en">
      <head>  
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Elms+Sans:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        </head>
      <body>{children}</body>
    </html>
  );
}
