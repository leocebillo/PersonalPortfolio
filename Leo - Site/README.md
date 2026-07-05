# Your Portfolio Site

A static site (plain HTML/CSS/JS, no build step) — the right choice for
"run it on my Pi now, maybe put it online later," since it needs nothing
more than a web server to serve files, and moves to any host unchanged.

## Files
- `index.html` — home page: hero + quick links to every section
- `photography.html`, `music.html`, `coding.html`, `calendar.html`, `about.html` — one standalone page per section
- Contact lives on `index.html` itself (as an in-page section, `#contact`) rather than its own file — the nav bar's "Contact" link jumps there directly on the home page, and links to `index.html#contact` from every other page
- `styles.css` — design system and layout, shared by every page
- `script.js` — shared behavior (mobile nav, audio player, lightbox, calendar); each feature only activates on the page that has the matching elements, so it's safe to include on every page
- `assets/photos/` — your real photos live here, referenced directly by `<img>` tags in `photography.html`
- `assets/audio/` — put mp3/ogg files here, matching each track's `data-src` in `music.html`

Each page is a normal link (`<a href="music.html">`), not an anchor jump — the
nav bar highlights whichever page you're on.

## 1. Get the files onto the Pi

From your main computer:
```bash
scp -r portfolio pi@<pi-ip-address>:/home/pi/
```
Or clone from GitHub if you push this folder to a repo first (recommended —
makes updates and the eventual move to public hosting much easier).

## 2. Serve it locally on the Pi

**Quickest option (good for testing):**
```bash
cd /home/pi/portfolio
python3 -m http.server 8080
```
Visit `http://<pi-ip-address>:8080` from any device on your home network.

**Proper option (nginx — recommended for anything long-running):**
```bash
sudo apt update
sudo apt install nginx -y
sudo cp -r /home/pi/portfolio/* /var/www/html/
sudo systemctl enable nginx
sudo systemctl restart nginx
```
Now visit `http://<pi-ip-address>` (port 80, no `:8080` needed).

Find your Pi's IP with `hostname -I` if you don't already have it.

### Optional: give it a name on your home network
```bash
sudo apt install avahi-daemon -y
```
Then visit `http://raspberrypi.local` from other devices on the same network
(rename the hostname first with `sudo raspi-config` if you want something
other than "raspberrypi").

## 3. Updating the site later
If you copied files into `/var/www/html`, re-copy after edits:
```bash
sudo cp -r /home/pi/portfolio/* /var/www/html/
```
If you're using git, `git pull` on the Pi and re-copy — or symlink
`/var/www/html` to your repo folder so a `git pull` is the only step.

## 4. Moving it public later
Because it's a static site, you have several low-effort paths, roughly
easiest to most control:

1. **GitHub Pages / Netlify / Vercel** — push the folder to a GitHub repo,
   connect it, done. Free, HTTPS included, zero server maintenance.
2. **Cloudflare Tunnel** — keep serving from the Pi itself, but expose it to
   the internet without opening ports on your router. Good if you want the
   Pi to stay the actual host.
3. **A cheap VPS** — copy the same nginx setup to a $5/mo server if you want
   full control and don't mind managing it.

Nothing in the HTML/CSS/JS needs to change for any of these — that portability
is the main reason a static site was the right call here.

## 5. The calendar

It's a real month-view calendar now, not a placeholder — built in plain JS,
no account or embed needed. To add or remove events, open `script.js` and
edit the `calendarEvents` array near the bottom:

```js
const calendarEvents = [
  { date: '2026-07-15', label: 'Golden hour shoot — downtown' },
  { date: '2026-07-22', label: 'Open mic night, 8pm' },
];
```

Dates use `YYYY-MM-DD`. Any date with an event gets a small dot and is
clickable; the "Upcoming" list below the grid always shows your next three
events automatically. Prev/next arrows move between months — nothing extra
to wire up.

**If you'd rather sync with an actual Google Calendar** (so you can add
events from your phone instead of editing code), swap the `.cal-widget` div
in `calendar.html` for a Google Calendar embed instead:
```html
<iframe src="https://calendar.google.com/calendar/embed?src=YOUR_CALENDAR_ID&ctz=America/Chicago"
        style="border:0" width="100%" height="500" frameborder="0"></iframe>
```
You'd get that URL from Google Calendar → Settings → your calendar →
"Integrate calendar." That calendar has to be set to public for the embed
to show anything.

## Still needs your input
A few spots are intentionally left as placeholders since only you have the
real info:
- **Contact form** — see "Setting up the contact form" below, it needs a
  real Formspree form ID.
- **Socials** — the github/instagram/soundcloud/spotify/tiktok links at the
  bottom of Contact are all `href="#"` right now; drop your real URLs in.
- **Project Two** — the coding section has one real project (the bakery
  site) and one placeholder card; fill in a second project or delete the
  card if you'd rather show just one for now.
- **Repo links** — "→ view repo" links are all `#` until you point them at
  actual GitHub repos.

## 6. Photography — now wired up
Your six photos are in `assets/photos/`, resized and compressed (originals
were 3–10MB each; they're now under 400KB so the page actually loads fast
on a Pi or a phone over cellular). Each one is a real `<img>` tag in
`photography.html` now — no more CSS placeholder gradients. Clicking any photo
opens it full-size in a lightbox (click outside it, hit Escape, or use the
✕ to close).

**To add more photos later:** copy one of the `<figure class="frame">`
blocks in the Photography section, point the `src` at a new file in
`assets/photos/`, and update the `alt` text and caption. Keep new photos
resized to a couple thousand pixels wide before adding them — full-size
DSLR/phone photos (10–20MB) will make the page noticeably slow to load,
especially on a Pi's upload bandwidth. Quick way to resize on the Pi itself:
```bash
sudo apt install imagemagick -y
convert original.jpg -resize '2000x2000>' -quality 82 -strip assets/photos/original.jpg
```

**Heads up on filenames:** Linux (what the Pi runs) is case-sensitive about
file extensions — `pic1.JPG` and `pic1.jpg` are different files as far as
the server is concerned. Keep the filename in `photography.html` matching the
actual file exactly, capitalization included.

## 7. Setting up the contact form (Formspree)
The form now posts to Formspree instead of opening an email client — visitors
get a normal "message sent" experience instead of their email app popping
open.
1. Go to [formspree.io](https://formspree.io) and create a free account.
2. Create a new form, and copy the form ID it gives you (looks like `xayzabcd`).
3. In `index.html`, find this line in the Contact section:
   ```html
   <form class="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
   and replace `YOUR_FORM_ID` with your real ID.
4. Formspree emails you every submission at the address you signed up with.
   The free plan covers 50 submissions/month, which is plenty for a personal
   site.

No server-side code needed on the Pi — Formspree hosts the form-handling
part, your static site just points at it.

## 8. The calendar, iOS-style
Restyled to feel closer to the iPhone Calendar app: dates are circles, today
is a filled red circle, tapping a date with an event highlights it in brass
and shows the details below — same data-driven setup as before, still
editable in the `calendarEvents` array in `script.js` (see section 5 above).

## 9. GitHub Pages
Since you've deployed there before — nothing special needed. Push this
folder to a repo, turn on Pages (Settings → Pages → deploy from branch),
and it'll serve `index.html` at the root automatically since there's no
build step. Same case-sensitivity rule as the Pi applies (GitHub Pages'
filesystem is case-sensitive too), so keep filenames matching exactly.

## Notes on the design
Dark ink background with a brass/amber accent, pulling a "meter" motif
(light meter, VU meter, activity indicator) through the hero, the music
player, and small UI details — one visual idea tying photography, music,
and code together instead of three unrelated sections bolted together.

Swap the placeholder copy (name, bio, project descriptions, socials) before
sharing — search the HTML for obvious placeholders like "Your Name" and
"Project One."
