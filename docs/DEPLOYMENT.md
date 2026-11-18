# Publishing to GitHub Pages

GitHub Pages hosts the site free. A GitHub Actions workflow ([`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)) builds and publishes it every time you push to the `main` branch.

## One-time setup

1. **Create a repository** on GitHub, for example `Aadesh-Neha-Wedding`.
   GitHub Pages is free for public repositories. Private repositories need a paid plan.

2. **Push the code** from the project folder:

   ```bash
   git init
   git add .
   git commit -m "Wedding invitation website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

3. **Switch Pages on**: in the repository open **Settings → Pages**, and under **Build and deployment → Source** choose **GitHub Actions**.

4. **Wait for the first deployment**: open the **Actions** tab. When the "Deploy to GitHub Pages" run shows a green tick, the site is live at

   ```
   https://<your-username>.github.io/<your-repo>/
   ```

   If the first run started before you switched Pages on and failed, open it and press **Re-run all jobs**.

## Updating the site later

Edit, commit and push. The site updates by itself in about a minute.

```bash
git add .
git commit -m "Add family names and photos"
git push
```

## How the address is handled

A project site lives in a sub-folder (`/<your-repo>/`), so every file path must include it. You do not need to set this by hand: the workflow reads the address from GitHub and passes it to the build as `BASE_PATH` and `SITE_URL`. Renaming the repository or adding a custom domain needs no code change.

To build by hand for a specific address:

```bash
BASE_PATH=/<your-repo>/ SITE_URL=https://<your-username>.github.io/<your-repo>/ npm run build
```

Without these, `npm run build` uses relative paths, which work from any folder.

## Custom domain (optional)

In **Settings → Pages → Custom domain**, enter your domain and follow GitHub's DNS instructions. The next deployment picks up the new address automatically.

## Link previews on WhatsApp

When the link is shared, WhatsApp and other apps show the title, description and the image `public/og-image.jpg`. These come from the tags at the top of [`index.html`](../index.html).

- Previews only work on the published address, not on `localhost`.
- Apps remember old previews for a while. If you change the image or text and the old preview still shows, add `?v=2` to the end of the link when sharing.

## Before you publish

- [ ] Replace every `[placeholder]` in `src/config/wedding.js` (see the table in the README).
- [ ] Tap **Get Directions** on a phone and check that it opens Ashirwad Lawns.
- [ ] Check every name and spelling against the printed card.
- [ ] Add the photos.
- [ ] Play the song on an Android phone and on an iPhone.
- [ ] Run `npm run build && npm run preview` and check the site on a phone.

## If something goes wrong

| Problem | Fix |
| --- | --- |
| Blank page, or missing styles on the published site | Check that **Settings → Pages → Source** is **GitHub Actions**, not "Deploy from a branch". |
| The workflow does not start | It runs on the `main` branch only. Check the branch name, or start it by hand from **Actions → Deploy to GitHub Pages → Run workflow**. |
| The deploy job fails with a permissions or "Pages not enabled" error | Pages was not switched on yet. Do step 3, then re-run the workflow. |
| Photos or music do not load | Paths in `wedding.js` must be relative with no leading slash (`gallery/a.jpg`), and file names must match exactly, including capital letters. |
