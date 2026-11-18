# Aadesh & Neha — Wedding Invitation Website

A single-page wedding invitation built with React and Vite.

- **Haldi** — Friday, 04 December 2026, 7:00 PM onwards
- **Wedding** — Saturday, 05 December 2026, 4:15 PM (lunch 12:00 PM to 3:00 PM)
- **Jagran Gondhal and Satyanarayan Puja** — Sunday, 06 December 2026
- **Venue** — Ashirwad Lawns, opposite Sahyadri College, Kalyan–Nagar Highway, Belhe, Tal. Junnar, Dist. Pune

The site is a static build with no server and no database, so it can be hosted free on GitHub Pages.

---

## Preview on your computer

You need [Node.js](https://nodejs.org) 22 or newer (20.19 or later also works).

```bash
npm install      # first time only
npm run dev
```

Open **http://localhost:5173** in your browser. The page reloads by itself whenever you save a file.

**To see it on your phone** (same Wi-Fi as the computer):

```bash
npm run dev -- --host
```

The terminal prints a `Network:` address such as `http://192.168.1.20:5173`. Open that address on the phone.

**To check the final production build** exactly as it will be published:

```bash
npm run build
npm run preview
```

Then open **http://localhost:4173**.

---

## Changing the wedding details

Every name, date, time, venue and message lives in one file:

**[`src/config/wedding.js`](src/config/wedding.js)**

Edit it, save, and the whole site updates. Nothing else needs to change.

### Details still to be filled in

Anything written in `[square brackets]` in the config is a placeholder. The site shows these as "to be added" notes until you replace them.

| What | Where in `wedding.js` |
| --- | --- |
| Time and place of the Sunday event (Jagran Gondhal) | `events[2].time`, `events[2].venue` |
| Portraits of the couple | `couple.groom.photo`, `couple.bride.photo` |
| Gallery photos | `gallery` |
| Wedding hashtag (optional) | `couple.hashtag` |

Fields ending in `Native` hold the same detail in Marathi, copied from the printed card. They appear as a second line under the English. Leave one empty to hide it.

### Events

Each entry in `events` becomes one card. To add, remove or reorder events, edit that list.

- `theme` picks the look: `'haldi'` (yellow and marigold), `'wedding'` (maroon and gold) or `'puja'` (champagne gold).
- `dressCode` takes one line, or a list such as `['Men: Yellow kurta', 'Women: Yellow dress or saree']`.
- `extras` adds rows to a card, for example the lunch timing.
- An event is shown at the main venue unless it has its own `venue` text.
- `start` and `end` are used only for the **Add to Calendar** button. Without them the calendar entry is an all-day one.

### Adding photos

1. Copy the photos into `public/gallery/`.
2. In `wedding.js`, set the `src` of each gallery item:

   ```js
   gallery: [
     { src: 'gallery/photo-1.jpg', alt: 'Aadesh and Neha at their engagement', caption: 'Engagement' },
   ],
   ```

Write paths without a leading slash (`gallery/photo-1.jpg`, not `/gallery/photo-1.jpg`).

Keep photos small so the page loads quickly on mobile data: about 1600 px on the longest side, saved as JPEG or WebP, ideally under 300 KB each.

### Music

Music is set in the `music` block of `wedding.js`. There are two ways to provide it.

**A YouTube link** (current setup)

```js
music: {
  youtube: 'https://www.youtube.com/watch?v=TVbI55pDdaI',
  title: 'Tu Hain Toh',
}
```

The official YouTube player appears in the "Our Song" card after the couple's introduction. Nothing is loaded from YouTube until the song starts.

On the published site YouTube usually plays an advertisement before the song. Guests can skip it on the video, but the site cannot remove it or choose what it is. (A local preview shows no advertisements, so this only appears once the site is online.)

**An audio file**

1. Copy an MP3 into `public/music/`.
2. Set `music.src` to, for example, `'music/our-song.mp3'` (and leave `youtube` in place or empty; the file wins).

It plays as background music with no video and no ads. Use a track you have the right to use. A song cannot simply be copied from YouTube.

**Starting by itself: `music.autoStart`**

No browser lets a page make sound before the guest has tapped something, so music can never start the instant the link opens. With `autoStart: true`:

| Source | When the music begins |
| --- | --- |
| Audio file | The moment the guest taps **Open Invitation**, on every phone and computer. |
| YouTube | When the song card scrolls onto the screen. YouTube only allows a video to start by itself while it is visible. On iPhones the guest still has to tap the video once. |

Keep `autoStart: false` while the source is YouTube (the current setting): what would start by itself is YouTube's advertisement, not the song. Use `autoStart: true` with an audio file.

With `autoStart: false`, guests press play themselves. Either way they can pause from the music button at any time, and once they pause it, it does not start again by itself.

To remove the music button and the song card completely, set `music.show` to `false`.

---

## Project structure

```
index.html              Page shell, fonts, SEO and social-sharing tags
public/                 Files copied as-is: favicon, sharing image, gallery/, music/
src/
  config/wedding.js     ← all wedding details
  App.jsx               Puts the sections together
  sections/             One file per page section (Hero, Couple, Countdown, Events, …)
  components/           Reusable pieces (WelcomeScreen, Navbar, Lightbox, MusicPlayer, SongCard, ornaments, florals)
  hooks/                Countdown, scroll-reveal, on-screen and reduced-motion helpers
  utils/                Link builders (Google Maps, calendar, asset paths) and the YouTube player
  styles/               global.css (colours, fonts, spacing) + one stylesheet per component
.github/workflows/      GitHub Pages deployment
docs/DEPLOYMENT.md      How to publish
```

Colours, fonts and spacing are defined once at the top of [`src/styles/global.css`](src/styles/global.css).

---

## Security

The site has no server, database, login or form, so there is nothing to break into or steal. What is in place:

- **HTTPS only.** GitHub Pages serves the site over an encrypted connection and refuses plain HTTP.
- **Content security policy.** The published page tells the browser exactly where it may load things from: this site, Google Fonts and the YouTube player. Anything else is refused. The policy is in [`vite.config.js`](vite.config.js); allow a new outside service there before using it.
- **Nothing from other companies loads by itself** except the fonts. YouTube is contacted only when a guest plays the song, through its privacy-enhanced address.
- **Hidden from search engines.** The page asks search engines not to list it, so it is found by link, not by searching names. Remove the `robots` line in [`index.html`](index.html) to change that.
- **Protected repository.** History on `main` cannot be rewritten or deleted, only GitHub's own actions may run, and GitHub watches for leaked passwords and vulnerable packages.
- **Careful deployment.** Each step of the workflow has only the permissions it needs, actions are pinned to exact versions, and packages are installed exactly as recorded with install scripts off.

What this cannot do: the invitation is a public page. Anyone who has the link can open it, and the repository is public too. Do not put anything in it that guests should not see.

The most important protection is on your GitHub account: switch on **two-factor authentication** (GitHub → Settings → Password and authentication). Whoever controls the account controls the site.

## Publishing

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for the step-by-step guide to GitHub Pages.

Nothing is published until you push the code to GitHub and switch Pages on.
