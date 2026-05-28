import './globals.css';

export const metadata = {
  title: "Game Developer Portfolio — Crafting Worlds, One Pixel at a Time",
  description: "Portfolio of a passionate game developer and designer. Explore my games, skills, and creative journey through handcrafted worlds.",
  keywords: "game developer, game designer, pixel art, Unity, Unreal Engine, indie games, portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Lora:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
