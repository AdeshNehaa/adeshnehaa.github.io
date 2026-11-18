import { useCallback, useEffect, useRef, useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import Navbar from './components/Navbar.jsx';
import MusicPlayer from './components/MusicPlayer.jsx';
import Footer from './components/Footer.jsx';
import Hero from './sections/Hero.jsx';
import Couple from './sections/Couple.jsx';
import Countdown from './sections/Countdown.jsx';
import Events from './sections/Events.jsx';
import Families from './sections/Families.jsx';
import Venue from './sections/Venue.jsx';
import Gallery from './sections/Gallery.jsx';
import Closing from './sections/Closing.jsx';
import { wedding } from './config/wedding.js';

export default function App() {
  const [opened, setOpened] = useState(false);
  const mainRef = useRef(null);
  const handleOpen = useCallback(() => setOpened(true), []);

  // Lock page scroll while the welcome / opening screen is showing.
  useEffect(() => {
    document.body.classList.toggle('is-locked', !opened);
    return () => document.body.classList.remove('is-locked');
  }, [opened]);

  // Once the invitation is open, hand keyboard and screen-reader focus to the page.
  useEffect(() => {
    if (opened) mainRef.current?.focus({ preventScroll: true });
  }, [opened]);

  return (
    <>
      {!opened && <WelcomeScreen onOpen={handleOpen} />}
      {/* `inert` keeps keyboard focus and screen readers out of the page until it is opened.
          Note: never give .app-shell a transform or filter — the fixed navbar depends on it. */}
      <div className={`app-shell${opened ? ' app-shell--open' : ''}`} inert={opened ? undefined : ''}>
        <a href="#main" className="skip-link">Skip to invitation</a>
        <Navbar />
        <main id="main" ref={mainRef} tabIndex={-1}>
          <Hero opened={opened} />
          <Couple opened={opened} />
          <Countdown />
          <Events />
          <Families />
          <Venue />
          <Gallery />
          <Closing />
        </main>
        <Footer />
        {wedding.music?.show !== false && <MusicPlayer />}
      </div>
    </>
  );
}
