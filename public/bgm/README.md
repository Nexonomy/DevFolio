# Background music

Drop a single file named `ambient.mp3` here. The `<BackgroundMusic />` toggle in the contact bar reads from `/bgm/ambient.mp3`.

- Loopable 1–3 min track works best (it auto-loops seamlessly).
- 128 kbps MP3 is plenty — keep the file under ~2 MB so first-time listeners don't wait.
- Browsers block autoplay, so nothing plays until the visitor clicks the Music toggle. Their preference is remembered in `localStorage`.

## Where to get a track (no copyright, no attribution needed)

- **Pixabay Music** — https://pixabay.com/music/ — pick anything, download the MP3, rename to `ambient.mp3`. All tracks are royalty-free, CC0-equivalent.
- **Free Music Archive** — https://freemusicarchive.org — filter by "Public Domain" or "CC0".
- **Chosic** — https://www.chosic.com/free-music/ — filter by "Creative Commons 0".

Good vibes for a game-dev portfolio: lofi, chiptune, synthwave, ambient electronic. Try searching Pixabay for `lofi loop`, `chiptune ambient`, `synthwave calm`, or `game menu`.

## Pointing at a different file

Set `NEXT_PUBLIC_BGM_URL` in your env to a full URL or alternate path. If `ambient.mp3` is missing, the toggle hides itself — no broken button appears.
