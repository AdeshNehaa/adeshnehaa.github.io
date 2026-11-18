import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Base path
 *   GitHub Pages serves a project site from https://<user>.github.io/<repo>/.
 *   The deploy workflow passes BASE_PATH (e.g. "/Aadesh-Neha-Wedding/") and
 *   SITE_URL (e.g. "https://<user>.github.io/Aadesh-Neha-Wedding/").
 *   Without them the build uses relative paths ("./"), which works from any folder.
 */
const withSlash = (value) => (value.endsWith('/') ? value : `${value}/`);
const siteUrl = process.env.SITE_URL ? withSlash(process.env.SITE_URL) : '';

/**
 * Content Security Policy for the published page.
 * It tells the browser exactly where this site may load things from; anything else is refused.
 * (GitHub Pages cannot send security headers, so the policy travels in the page itself.)
 * If you add a new outside service (another video host, a map embed, a font host…), allow it here.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'", // by default: only files from this site
  "script-src 'self' https://www.youtube.com", // this site's code + YouTube's player (fetched only when a guest plays the song)
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // this site's styles + Google Fonts
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "media-src 'self'", // an audio file in /public/music
  "frame-src https://www.youtube-nocookie.com", // the only thing that may be embedded: the YouTube player
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'", // the site has no forms; none can be added by an attacker
].join('; ');

/**
 * Finishes index.html:
 *   - fills %SITE_URL% so WhatsApp / Facebook get absolute preview-image links;
 *   - adds the security policy to the published build (the dev server needs looser rules for live reload).
 */
const htmlPlugin = () => ({
  name: 'wedding-html',
  transformIndexHtml: {
    order: 'pre',
    handler(html, ctx) {
      let page = html.replaceAll('%SITE_URL%', siteUrl || './');
      if (!ctx.server) {
        const charset = '<meta charset="UTF-8" />';
        if (!page.includes(charset)) throw new Error('index.html: could not find the charset tag to place the security policy after');
        page = page.replace(charset, `${charset}\n    <meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`);
      }
      return page;
    },
  },
});

export default defineConfig(({ command }) => ({
  plugins: [react(), htmlPlugin()],
  base: process.env.BASE_PATH ? withSlash(process.env.BASE_PATH) : command === 'build' ? './' : '/',
  build: {
    target: 'es2019',
    cssCodeSplit: false,
    assetsInlineLimit: 4096,
  },
}));
