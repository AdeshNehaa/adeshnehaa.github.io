/**
 * The visitor's tap on "Open Invitation".
 *
 * Browsers only let a page start sound from inside a tap or click, and this is the one
 * tap every visitor makes. The welcome screen announces it here; the music player listens
 * (when `wedding.music.autoStart` is on) and begins playing inside that same tap.
 */
const handlers = new Set();

export const openGesture = {
  /** Run `handler` inside the visitor's tap. Returns a function that stops listening. */
  on(handler) {
    handlers.add(handler);
    return () => handlers.delete(handler);
  },
  /** Called synchronously from the click handler of the "Open Invitation" button. */
  fire() {
    handlers.forEach((handler) => {
      try {
        handler();
      } catch {
        /* music is optional: it must never stop the invitation from opening */
      }
    });
  },
};
