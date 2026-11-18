/**
 * YouTube song player — shared by the "Our Song" card and the floating music button.
 *
 * Nothing from YouTube is loaded until the song is started: `song.start()` is the only
 * thing that fetches YouTube's player script and creates the player. It runs when the
 * visitor presses play, or — only if `wedding.music.autoStart` is on — once, when the song
 * card has scrolled onto the screen (see SongCard.jsx).
 *
 * The player is the official YouTube embed (privacy-enhanced "nocookie" host). It stays
 * visible in the song card; this file only gives the rest of the page play / pause / mute.
 */

const VIDEO_ID = /^[\w-]{11}$/;
const API_SRC = 'https://www.youtube.com/iframe_api';
const PLAYER_HOST = 'https://www.youtube-nocookie.com';

/** Accepts a YouTube link in any common form (or a bare video id) and returns the 11-character id, or ''. */
export function parseYouTubeId(input) {
  if (typeof input !== 'string') return '';
  const value = input.trim();
  if (!value) return '';
  if (VIDEO_ID.test(value)) return value;
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return '';
  }
  const host = url.hostname.replace(/^(www|m|music)\./, '');
  let id = '';
  if (host === 'youtu.be') {
    id = url.pathname.split('/')[1] || '';
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
    else id = /^\/(?:embed|shorts|live|v)\/([\w-]{11})/.exec(url.pathname)?.[1] || '';
  }
  return VIDEO_ID.test(id) ? id : '';
}

/** The normal YouTube page for a video — used for the "Open on YouTube" fallback link. */
export const getWatchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

/* ───────── Shared state ─────────
 * status   idle     nothing loaded yet
 *          loading  the player is starting. YouTube may be showing an advertisement first:
 *                   it does not tell the page about those, so this can last a while.
 *          playing  ·  paused
 *          blocked  the browser reported that it wants a tap on the video itself (some phones)
 *          error    the video could not be loaded or played
 */
let state = { status: 'idle', muted: false, volume: 60, error: 0 };
const listeners = new Set();
const set = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
};

let mount = null; // the element the player is created in (registered by the song card)
let videoId = '';
let player = null;
let apiPromise = null;
let selfStarted = false; // the song starts by itself at most once per visit

const ready = () => player && typeof player.playVideo === 'function';
const quietly = (action) => {
  try {
    action();
  } catch {
    /* the player was not ready, or has been removed — nothing to do */
  }
};

function loadApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === 'function') previous();
      resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = API_SRC;
    script.async = true;
    script.onerror = () => {
      apiPromise = null; // allow another try on the next tap
      script.remove();
      reject(new Error('The YouTube player could not be loaded'));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

function removePlayer() {
  if (player) quietly(() => player.destroy());
  player = null;
  if (mount) mount.replaceChildren();
}

function createPlayer(YT) {
  if (!mount || player) return;
  const slot = document.createElement('div');
  mount.replaceChildren(slot);
  player = new YT.Player(slot, {
    host: PLAYER_HOST,
    videoId,
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1, // we are inside the visitor's own tap
      playsinline: 1,
      rel: 0,
      loop: 1,
      playlist: videoId, // YouTube needs this to loop a single video
      origin: window.location.origin,
    },
    events: {
      onReady: (event) => {
        quietly(() => {
          event.target.setVolume(state.volume);
          if (state.muted) event.target.mute();
          event.target.playVideo();
        });
      },
      onStateChange: (event) => {
        const { PLAYING, PAUSED, BUFFERING, ENDED } = YT.PlayerState;
        if (event.data === PLAYING) {
          set({ status: 'playing', error: 0 });
        } else if (event.data === PAUSED || event.data === ENDED) {
          set({ status: 'paused' });
        } else if (event.data === BUFFERING && state.status !== 'playing') {
          set({ status: 'loading' });
        }
      },
      onAutoplayBlocked: () => set({ status: 'blocked' }),
      onError: (event) => {
        removePlayer();
        set({ status: 'error', error: Number(event.data) || 1 });
      },
    },
  });
}

export const song = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getState: () => state,

  /** The song card tells us where the player lives and which video to play. */
  register(element, id) {
    mount = element;
    videoId = id;
  },
  unregister(element) {
    if (mount !== element) return;
    removePlayer();
    mount = null;
    set({ status: 'idle', error: 0 });
  },

  /** Play. Call only from the visitor's own tap or click. Loads YouTube on first use. */
  start() {
    if (ready()) {
      quietly(() => player.playVideo());
      return;
    }
    if (!mount || !videoId || state.status === 'loading') return;
    set({ status: 'loading', error: 0 });
    loadApi()
      .then(createPlayer)
      .catch(() => set({ status: 'error', error: -1 }));
  },

  /**
   * Start without a tap — at most once, and only if the visitor has not used the player yet.
   * Call it only while the player is on screen (YouTube's rule for self-starting videos).
   */
  autoStart() {
    if (selfStarted || state.status !== 'idle') return;
    selfStarted = true;
    song.start();
  },

  pause() {
    if (ready()) quietly(() => player.pauseVideo());
  },

  setMuted(muted) {
    set({ muted: Boolean(muted) });
    if (ready()) quietly(() => (muted ? player.mute() : player.unMute()));
  },

  /** Volume from 0 to 100. Moving it above zero also un-mutes. */
  setVolume(value) {
    const volume = Math.min(100, Math.max(0, Math.round(Number(value) || 0)));
    set({ volume, muted: volume > 0 ? false : state.muted });
    if (ready()) {
      quietly(() => {
        player.setVolume(volume);
        if (volume > 0) player.unMute();
      });
    }
  },
};
