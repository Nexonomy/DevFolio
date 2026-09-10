import './globals.css';
import './portfolio.css';
import localFont from 'next/font/local';
const space = localFont({ src: './fonts/SpaceGrotesk.ttf', variable: '--font-space', display: 'swap', weight: '300 700' });

export const metadata = {
  title: "Ahsan Tariq — Game Developer & Designer",
  description: "Portfolio of a passionate game developer and designer. Explore my games, skills, and creative journey through handcrafted worlds.",
  keywords: "game developer, game designer, pixel art, Unity, Unreal Engine, indie games, portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth" className={space.variable}>

      <body>{children}</body>
    </html>
  );
}


