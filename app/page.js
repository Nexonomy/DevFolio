import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Work from './components/Work';
import About from './components/About';
import Contact from './components/Contact';
import PixelDivider from './components/PixelDivider';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <PixelDivider />
      <Work />
      <PixelDivider />
      <About />
      <PixelDivider />
      <Contact />
    </>
  );
}
