import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meta Ad Account Setup — Whitney Bateson",
  description:
    "A guided walkthrough to get your Facebook, Instagram and Meta ad account ready so we can run ads for you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Fonts loaded via <link> rather than next/font so the build never
            needs network access to succeed.

            These are FALLBACKS that approximate Whitney's licensed brand fonts
            until the real ones are activated:
              Playfair Display  ~ Boston Angel   (display / headings)
              Montserrat        ~ Proxima Nova   (body)
              Caveat            ~ Milkshake       (handwritten accents)

            To activate the real fonts via Adobe Fonts, add her web-project kit
            here, e.g.:
              <link rel="stylesheet" href="https://use.typekit.net/XXXXXXX.css" />
            The licensed family names are already first in each stack (see
            globals.css), so they take over automatically once loaded. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Caveat:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
