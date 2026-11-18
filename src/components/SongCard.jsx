import { useEffect, useRef, useSyncExternalStore } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { wedding } from '../config/wedding.js';
import { song, parseYouTubeId, getWatchUrl } from '../utils/youtube.js';
import Reveal from './Reveal.jsx';
import ConfigText from './ConfigText.jsx';
import { Mandala } from './Ornament.jsx';
import { Lotus } from './Florals.jsx';
import '../styles/song.css';

/** The id the floating music button scrolls to. */
export const SONG_CARD_ID = 'our-song';

/**
 * "Our Song" — the couple's song, played by the official YouTube player.
 *
 * Shown only when `wedding.music.youtube` holds a YouTube link (and no audio file is set).
 * Until the song starts the card shows its own poster and nothing is loaded from YouTube;
 * starting it swaps in the real player, which then keeps playing while the visitor scrolls
 * on through the invitation.
 *
 * With `wedding.music.autoStart` on, the song starts by itself — once, after the invitation
 * has been opened, when more than half of the player is on screen. (YouTube only allows a
 * video to start by itself while it is visible; some phones still ask for a tap on it.)
 */
export default function SongCard({ opened = true }) {
  const music = wedding.music || {};
  const videoId = music.src ? '' : parseYouTubeId(music.youtube);
  const enabled = Boolean(videoId) && music.show !== false;
  const autoStart = enabled && music.autoStart === true;

  const { status } = useSyncExternalStore(song.subscribe, song.getState);
  const mountRef = useRef(null);
  const stageRef = useRef(null);
  const posterHadFocus = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;
    const element = mountRef.current;
    song.register(element, videoId);
    return () => song.unregister(element);
  }, [enabled, videoId]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!autoStart || !opened || !stage || !('IntersectionObserver' in window)) return undefined;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (entry.intersectionRatio < 0.6) return;
        // a short pause, so the card has finished appearing and a quick scroll past does not start it
        timer = window.setTimeout(() => {
          observer.disconnect();
          song.autoStart();
        }, 600);
      },
      { threshold: [0, 0.6] }
    );
    observer.observe(stage);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [autoStart, opened]);

  // The poster button disappears once the player loads: keep keyboard focus on the stage.
  useEffect(() => {
    if (status !== 'idle' && posterHadFocus.current) {
      posterHadFocus.current = false;
      stageRef.current?.focus({ preventScroll: true });
    }
  }, [status]);

  if (!enabled) return null;

  const title = music.title || 'Our song';
  const start = (event) => {
    posterHadFocus.current = document.activeElement === event.currentTarget;
    song.start();
  };

  return (
    <Reveal className="song" id={SONG_CARD_ID} delay={160}>
      <div className="song__card frame">
        <Lotus className="song__lotus" size={46} strokeWidth={1.3} />
        <p className="eyebrow song__eyebrow">Our Song</p>
        <h3 className="song__title script"><ConfigText value={title} /></h3>
        {music.credit && <p className="song__credit"><ConfigText value={music.credit} /></p>}

        <div
          ref={stageRef}
          className={`song__stage song__stage--${status}`}
          tabIndex={-1}
          role="group"
          aria-label={`Video player for our song, ${title}`}
        >
          {/* the YouTube player is created in here, only after the visitor presses play */}
          <div ref={mountRef} className="song__player" />

          {status === 'loading' && <p className="song__wait">Loading the song…</p>}

          {(status === 'idle' || status === 'error') && (
            <div className="song__poster">
              <Mandala className="song__poster-art" size={320} color="var(--gold-light)" strokeWidth={0.7} />
              {status === 'idle' ? (
                <button
                  type="button"
                  className="song__play"
                  onClick={start}
                  aria-label={`Play our song, ${title}. This loads the YouTube player.`}
                >
                  <span className="song__play-disc" aria-hidden="true">
                    <Play size={30} strokeWidth={1.5} aria-hidden="true" focusable="false" />
                  </span>
                  <span className="song__play-label">Play our song</span>
                  <span className="song__play-note">Plays from YouTube</span>
                </button>
              ) : (
                <div className="song__error" role="alert">
                  <p className="song__error-text">This song can’t be played here right now.</p>
                  <div className="song__error-actions">
                    <button type="button" className="btn btn--gold song__retry" onClick={start}>Try again</button>
                    <a className="song__open" href={getWatchUrl(videoId)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={16} strokeWidth={1.5} aria-hidden="true" focusable="false" />
                      <span>Open on YouTube<span className="sr-only"> (opens in a new tab)</span></span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="song__hint" role="status">
          {status === 'blocked' && 'Tap the video once more to start the music.'}
        </p>
        <p className="song__note">Once it starts, the music keeps playing as you scroll.</p>
      </div>
    </Reveal>
  );
}
