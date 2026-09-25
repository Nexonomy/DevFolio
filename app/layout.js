import './globals.css';
import './portfolio.css';
import localFont from 'next/font/local';
import MotionLayer from './components/MotionLayer';
const space = localFont({ src: './fonts/SpaceGrotesk.ttf', variable: '--font-space', display: 'swap', weight: '300 700' });

export const metadata = {
  title: "Ahsan Tariq — Game Developer",
  description: "Ahsan Tariq is a game developer building gameplay systems, interactive worlds, and visually thoughtful experiences.",
  keywords: "Ahsan Tariq, game developer, gameplay programmer, Unity, Unreal Engine, portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" data-scroll-behavior="smooth" className={space.variable}>
      <body><MotionLayer />{children}</body>
    </html>
  );
}
