// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const nav = document.querySelector('.nav');
navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', false);
}));

// Footer year (present on every page)
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Music: shared audio player for the tracklist (music.html only) ----------
const audio = document.getElementById('audioPlayer');
if (audio) {
  const tracks = document.querySelectorAll('.track');

  tracks.forEach(track => {
    const btn = track.querySelector('.play-btn');
    btn.addEventListener('click', () => {
      const isPlaying = track.classList.contains('playing');

      // stop any other playing track
      tracks.forEach(t => t.classList.remove('playing'));

      if (isPlaying) {
        audio.pause();
        return;
      }

      const src = track.getAttribute('data-src');
      audio.src = src;
      audio.play().catch(() => {
        // no audio file wired up yet — surface a gentle console note
        console.info(`No audio file found at "${src}" yet. Add your track there.`);
      });
      track.classList.add('playing');
    });
  });

  audio.addEventListener('ended', () => {
    tracks.forEach(t => t.classList.remove('playing'));
  });
}

// ---------- Photo lightbox (photography.html only) ----------
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('.frame-img img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
    });
  });

  function closeLightbox() { lightbox.classList.remove('open'); }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

// ---------- Calendar (calendar.html only) ----------
const calGrid = document.getElementById('calGrid');
if (calGrid) {
  // Add/remove events here. Format: 'YYYY-MM-DD'.
  const calendarEvents = [
    { date: '2026-07-04', label: 'Job Interview, 9:30am' },
    { date: '2026-07-05', label: 'FIFA Mexico Game!' },
    { date: '2026-07-08', label: 'After The Bloom - Release!' },
    { date: '2026-07-13', label: 'Phase 1 of GardenDefense completed!' },
    { date: '2026-07-15', label: 'Personal Site - Complete Release!' },
  ];

  const calMonthLabel = document.getElementById('calMonthLabel');
  const calUpcomingList = document.getElementById('calUpcomingList');
  let calViewDate = new Date();
  calViewDate.setDate(1);

  const pad2 = (n) => String(n).padStart(2, '0');
  const toDateKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  function renderCalendar() {
    const year = calViewDate.getFullYear();
    const month = calViewDate.getMonth();
    calMonthLabel.textContent = calViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = toDateKey(new Date());

    calGrid.innerHTML = '';
    for (let i = 0; i < firstWeekday; i++) {
      calGrid.appendChild(document.createElement('span'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = toDateKey(new Date(year, month, day));
      const dayEvents = calendarEvents.filter(e => e.date === dateKey);

      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cal-day';
      cell.textContent = day;
      if (dateKey === todayKey) cell.classList.add('is-today');

      if (dayEvents.length) {
        cell.classList.add('has-event');
        cell.setAttribute('aria-label', `${dateKey}: ${dayEvents.map(e => e.label).join(', ')}`);
        cell.addEventListener('click', () => {
          calGrid.querySelectorAll('.cal-day.is-selected').forEach(c => c.classList.remove('is-selected'));
          cell.classList.add('is-selected');
          showEventDetail(dayEvents, dateKey);
        });
      }
      calGrid.appendChild(cell);
    }

    renderUpcoming();
  }

  function formatDateKey(dateKey, opts) {
    return new Date(`${dateKey}T00:00:00`).toLocaleDateString('default', opts);
  }

  function showEventDetail(events, dateKey) {
    const formatted = formatDateKey(dateKey, { weekday: 'long', month: 'long', day: 'numeric' });
    calUpcomingList.innerHTML = events
      .map(e => `<li><span class="cal-dot"></span>${formatted} — ${e.label}</li>`)
      .join('');
  }

  function renderUpcoming() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = calendarEvents
      .filter(e => new Date(`${e.date}T00:00:00`) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);

    if (!upcoming.length) {
      calUpcomingList.innerHTML = `<li class="cal-empty">Nothing scheduled yet — add events in script.js</li>`;
      return;
    }

    calUpcomingList.innerHTML = upcoming
      .map(e => `<li><span class="cal-dot"></span>${formatDateKey(e.date, { weekday: 'short', month: 'short', day: 'numeric' })} — ${e.label}</li>`)
      .join('');
  }

  document.getElementById('calPrev').addEventListener('click', () => {
    calViewDate.setMonth(calViewDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById('calNext').addEventListener('click', () => {
    calViewDate.setMonth(calViewDate.getMonth() + 1);
    renderCalendar();
  });

  renderCalendar();
}
