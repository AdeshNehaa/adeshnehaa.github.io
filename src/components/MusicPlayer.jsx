import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { Music, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { wedding } from '../config/wedding.js';
import { asset } from '../utils/links.js';
import { song, parseYouTubeId } from '../utils/youtube.js';
import { openGesture } from '../utils/openGesture.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { Lotus } from './Florals.jsx';
import { SONG_CARD_ID } from './SongCard.jsx';
import '../styles/music.css';

const ICON = { strokeWidth: 1.5, 'aria-hidden': true, focusable: 'false' };

const STATUS_TEXT = {
  soon: 'Music will be added soon',
  idle: 'Press play to listen',
  loading: 'Loading…',
  playing: 'Now playing',
  paused: 'Paused',
  blocked: 'Tap the video to start the music',
  error: 'Music is unavailable right now',
};

/** Phones and tablets set the volume with their own buttons; a web page cannot change it there. */
const coarsePointer = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(pointer: coarse)').matches);

/**
 * Floating background-music control.
 *
 * The source comes from `wedding.music`:
 *   src      an audio file. The <audio> element does not even exist until playback is
 *            started, and it is created with preload="none", so nothing is downloaded
 *            before that either.
 *   youtube  a YouTube link. The official player lives in the "Our Song" card on the
 *            page (see SongCard.jsx); this button is its remote control. Nothing is
 *            loaded from YouTube until the song is started.
 *
 * Nothing plays on page load. With `wedding.music.autoStart` off, music starts only when
 * the visitor presses Play. With it on, an audio file starts inside the visitor's tap on
 * "Open Invitation" (the one moment a browser allows it), and a YouTube song starts when
 * its card scrolls onto the screen. Either way the visitor can pause it here at any time.
 *
 * With neither source set the button is still shown, in a quiet "music will be added
 * soon" state with its controls disabled.
 */
export default function MusicPlayer() {
  const music = wedding.music || {};
  const youtubeId = music.src ? '' : parseYouTubeId(music.youtube);
  const isYouTube = Boolean(youtubeId);
  const available = Boolean(music.src) || isYouTube;
  const title = music.title || 'Background music';
  const reducedMotion = useReducedMotion();
  const yt = useSyncExternalStore(song.subscribe, song.getState);

  const panelId = useId();
  const rootRef = useRef(null);
  const toggleRef = useRef(null);
  const audioRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false); // true once the visitor has pressed Play
  const [status, setStatus] = useState('idle'); // idle | loading | playing | paused | error
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [volumeLocked, setVolumeLocked] = useState(false); // iOS: only the phone's own buttons set the volume

  // One view of the player state, whichever source is playing.
  const currentStatus = isYouTube ? yt.status : status;
  const isMuted = isYouTube ? yt.muted : muted;
  const shown = available ? currentStatus : 'soon';
  const playing = available && currentStatus === 'playing';
  const active = playing || (available && currentStatus === 'loading');
  const level = isYouTube ? yt.volume : Math.round(volume * 100);
  const volumeFixed = isYouTube ? coarsePointer() : volumeLocked;

  /** Bring the "Our Song" card (and its video) into view. */
  const showVideo = () => {
    setOpen(false);
    document.getElementById(SONG_CARD_ID)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  };

  const play = () => {
    if (!available) return;
    if (isYouTube) {
      // The first time, the video has to come on screen: that is where it plays,
      // and some phones want a tap on the video itself before sound may start.
      const firstStart = yt.status !== 'paused';
      song.start();
      if (firstStart) showVideo();
      return;
    }
    // Create the <audio> element now, inside the visitor's own tap.
    if (!armed) flushSync(() => setArmed(true));
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    audio.volume = volume;
    if (Math.abs(audio.volume - volume) > 0.01) setVolumeLocked(true);
    if (audio.error) audio.load(); // try again after a failure
    setStatus('loading');
    let started;
    try {
      started = audio.play();
    } catch {
      setStatus('error');
      return;
    }
    if (started && typeof started.catch === 'function') {
      started.catch((error) => {
        const name = error && error.name;
        if (name === 'AbortError') return; // paused again before it could start
        setStatus(name === 'NotAllowedError' ? 'paused' : 'error');
      });
    }
  };

  const pause = () => (isYouTube ? song.pause() : audioRef.current?.pause());

  // Auto-start for an audio file: begin inside the visitor's tap on "Open Invitation".
  const playRef = useRef(play);
  playRef.current = play;
  const startsOnOpen = music.autoStart === true && Boolean(music.src);
  useEffect(() => {
    if (!startsOnOpen) return undefined;
    return openGesture.on(() => playRef.current());
  }, [startsOnOpen]);

  const toggleMute = () => {
    if (isYouTube) {
      song.setMuted(!yt.muted);
      return;
    }
    const next = !muted;
    setMuted(next);
    if (audioRef.current) audioRef.current.muted = next;
  };

  const changeVolume = (event) => {
    const next = Math.min(1, Math.max(0, Number(event.target.value) / 100));
    if (isYouTube) {
      song.setVolume(next * 100);
      return;
    }
    setVolume(next);
    if (next > 0 && muted) setMuted(false); // moving the slider un-mutes
    const audio = audioRef.current;
    if (audio) {
      audio.volume = next;
      if (next > 0) audio.muted = false;
    }
  };

  // Close the panel on Escape or a click / tap anywhere outside it.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape' && event.key !== 'Esc') return;
      const hadFocus = rootRef.current?.contains(document.activeElement);
      setOpen(false);
      if (hadFocus) toggleRef.current?.focus();
    };
    const pointerEvent = window.PointerEvent ? 'pointerdown' : 'mousedown';
    document.addEventListener(pointerEvent, onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener(pointerEvent, onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Be polite: stop the music when the tab or the browser goes to the background.
  // (It is not restarted afterwards — playing is always the visitor's own choice.)
  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (document.hidden && audio && !audio.paused) audio.pause();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <aside
      ref={rootRef}
      className={`music-player${open ? ' music-player--open' : ''}${playing ? ' music-player--playing' : ''}${available ? '' : ' music-player--soon'}`}
      aria-label="Background music"
    >
      <button
        ref={toggleRef}
        type="button"
        className="music-player__toggle"
        aria-label={playing ? 'Music player, now playing' : 'Music player'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="music-player__pulse" aria-hidden="true" />
        {playing ? (
          <span className="music-player__eq" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
        ) : (
          <Music size={21} {...ICON} />
        )}
      </button>

      <div id={panelId} className="music-player__panel frame" role="group" aria-label="Music player">
        <Lotus className="music-player__lotus" size={38} color="var(--gold-deep)" strokeWidth={1.3} />
        <p className="music-player__eyebrow">{isYouTube ? 'Our song' : 'Background music'}</p>
        <p className="music-player__title">{title}</p>
        <p className={`music-player__status${available ? '' : ' placeholder-text'}`} role="status">
          {isYouTube && shown === 'loading' ? 'Starting on YouTube…' : STATUS_TEXT[shown]}
        </p>

        <div className="music-player__controls">
          <button
            type="button"
            className="music-player__btn music-player__btn--play"
            aria-label={active ? 'Pause music' : 'Play music'}
            disabled={!available}
            onClick={active ? pause : play}
          >
            {active ? <Pause size={20} {...ICON} /> : <Play size={20} {...ICON} />}
          </button>
          <button
            type="button"
            className="music-player__btn"
            aria-label="Mute"
            aria-pressed={isMuted}
            disabled={!available}
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX size={19} {...ICON} /> : <Volume2 size={19} {...ICON} />}
          </button>
          <input
            type="range"
            className="music-player__volume"
            min="0"
            max="100"
            step="5"
            value={level}
            aria-label="Volume"
            aria-valuetext={`${level}%`}
            disabled={!available || volumeFixed}
            onChange={changeVolume}
            style={{ '--music-player-level': `${level}%` }}
          />
        </div>
        {volumeFixed && available && (
          <p className="music-player__hint">Use your device’s volume buttons to adjust the sound.</p>
        )}
        {isYouTube && (
          <p className="music-player__source">
            <button type="button" className="music-player__link" onClick={showVideo}>Show the video</button>
            <span className="music-player__source-note">Plays from YouTube</span>
          </p>
        )}
      </div>

      {Boolean(music.src) && armed && (
        <audio
          ref={audioRef}
          src={asset(music.src)}
          preload="none"
          loop
          onPlaying={() => setStatus('playing')}
          onWaiting={() => setStatus('loading')}
          onPause={() => setStatus((current) => (current === 'error' ? current : 'paused'))}
          onError={() => setStatus('error')}
        />
      )}
    </aside>
  );
}
