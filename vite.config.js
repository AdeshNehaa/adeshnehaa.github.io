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

/** Fills %SITE_URL% in index.html so WhatsApp / Facebook get absolute preview-image links. */
const siteUrlPlugin = () => ({
  name: 'wedding-site-url',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) => html.replaceAll('%SITE_URL%', siteUrl || './'),
  },
});

export default defineConfig(({ command }) => ({
  plugins: [react(), siteUrlPlugin()],
  base: process.env.BASE_PATH ? withSlash(process.env.BASE_PATH) : command === 'build' ? './' : '/',
  build: {
    target: 'es2019',
    cssCodeSplit: false,
    assetsInlineLimit: 4096,
  },
}));
