/**
 * Parse a datetime string and timezone into a Date (UTC instant).
 * @param {string} dateStr - ISO date or "YYYY-MM-DD HH:mm"
 * @param {string} tz - IANA timezone (e.g. "Europe/London")
 * @returns {Date|null} Target instant or null if invalid
 */
export function parseEventDate(dateStr, tz) {
  if (!dateStr || !tz || typeof dateStr !== 'string' || typeof tz !== 'string') return null;
  try {
    const normalized = dateStr.trim().replace(/\s+/, 'T');
    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return null;
    const [, y, m, d, h, min] = match;
    const midnightUTC = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
    const tzAtMidnight = new Date(midnightUTC.getTime()).toLocaleString('en-CA', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = tzAtMidnight.split(':');
    const tzH = Number(parts[0]) || 0;
    const tzM = Number(parts[1]) || 0;
    const offsetMs = (tzH * 60 + tzM) * 60 * 1000;
    const targetMs = midnightUTC.getTime() + (Number(h) * 60 + Number(min)) * 60 * 1000 - offsetMs;
    return new Date(targetMs);
  } catch {
    return null;
  }
}

const LABELS = {
  days: 'DAYS', hours: 'HOURS', minutes: 'MINUTES', seconds: 'SECONDS',
};
const ARIA_COUNTDOWN = 'Countdown to the event';
const ARIA_TIME_REMAINING = 'Time remaining until race start';
const ARIA_HOURS = (d, h) => `${d} days ${h} hours remaining`;
const ARIA_FINAL_MINUTE = 'Less than 1 minute remaining';

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const hasSpacing = block.classList.contains('spacing-small')
    || block.classList.contains('spacing-medium')
    || block.classList.contains('spacing-large');
  if (!hasSpacing) block.classList.add('spacing-medium');

  const rows = [...block.children];
  const getCell = (rowIdx, colIdx) => rows[rowIdx]?.children[colIdx]?.textContent?.trim() ?? '';

  const pretitle = getCell(0, 0);
  const title = getCell(1, 0);
  const dateStr = getCell(2, 0);
  const timezone = getCell(2, 1);
  const targetDate = parseEventDate(dateStr, timezone);

  const milestones = [];
  for (let i = 3; i <= 4 && rows[i]; i += 1) {
    const t = getCell(i, 0);
    const t1 = getCell(i, 1);
    const t2 = getCell(i, 2);
    if (t || t1 || t2) milestones.push({ title: t, text1: t1, text2: t2 });
  }

  block.replaceChildren();

  if (pretitle || title) {
    const header = document.createElement('div');
    header.className = 'countdown-header';
    if (pretitle) {
      const p = document.createElement('p');
      p.className = 'countdown-pretitle';
      p.textContent = pretitle;
      header.append(p);
    }
    if (title) {
      const h2 = document.createElement('h2');
      h2.className = 'countdown-title';
      h2.textContent = title;
      header.append(h2);
    }
    block.append(header);
  }

  const timer = document.createElement('div');
  timer.className = 'countdown-timer';
  timer.setAttribute('aria-label', ARIA_COUNTDOWN);

  const units = ['days', 'hours', 'minutes', 'seconds'];
  units.forEach((key) => {
    const unit = document.createElement('div');
    unit.className = 'countdown-unit';
    const val = document.createElement('span');
    val.className = 'countdown-value';
    val.textContent = '00';
    val.setAttribute('aria-hidden', 'true');
    const lbl = document.createElement('span');
    lbl.className = 'countdown-label';
    lbl.textContent = LABELS[key];
    lbl.setAttribute('aria-hidden', 'true');
    unit.append(val, lbl);
    timer.append(unit);
    if (key !== 'seconds') {
      const div = document.createElement('div');
      div.className = 'countdown-divider';
      div.setAttribute('aria-hidden', 'true');
      timer.append(div);
    }
  });

  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'countdown-aria-live';
  liveRegion.setAttribute('aria-label', ARIA_TIME_REMAINING);
  Object.assign(liveRegion.style, {
    position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)',
  });

  block.append(timer, liveRegion);

  if (milestones.length) {
    const events = document.createElement('div');
    events.className = 'countdown-events';
    milestones.forEach(({ title: t, text1, text2 }) => {
      const badge = document.createElement('div');
      badge.className = 'countdown-badge';
      const badgeTitle = document.createElement('span');
      badgeTitle.className = 'countdown-badge-title';
      badgeTitle.textContent = t;
      const dt = document.createElement('div');
      dt.className = 'countdown-badge-datetime';
      if (text1) {
        const s1 = document.createElement('span');
        s1.textContent = text1;
        dt.append(s1);
      }
      if (text1 && text2) {
        const sep = document.createElement('span');
        sep.className = 'countdown-badge-sep';
        dt.append(sep);
      }
      if (text2) {
        const s2 = document.createElement('span');
        s2.textContent = text2;
        dt.append(s2);
      }
      badge.append(badgeTitle, dt);
      events.append(badge);
    });
    block.append(events);
  }

  const valueEls = timer.querySelectorAll('.countdown-value');
  let lastAnnounced = '';
  let intervalId;

  function formatRemaining(now) {
    if (!targetDate || now >= targetDate) {
      return {
        days: 0, hours: 0, minutes: 0, seconds: 0,
      };
    }
    const diff = targetDate - now;
    const days = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return {
      days, hours: h, minutes: m, seconds: s,
    };
  }

  function announce(msg) {
    if (msg && msg !== lastAnnounced) {
      lastAnnounced = msg;
      liveRegion.textContent = msg;
    }
  }

  function tick() {
    const now = new Date();
    const r = formatRemaining(now);

    valueEls[0].textContent = String(r.days).padStart(2, '0');
    valueEls[1].textContent = String(r.hours).padStart(2, '0');
    valueEls[2].textContent = String(r.minutes).padStart(2, '0');
    valueEls[3].textContent = String(r.seconds).padStart(2, '0');

    if (r.days === 0 && r.hours === 0 && r.minutes < 1 && r.seconds <= 30) {
      announce(ARIA_FINAL_MINUTE);
    } else if (r.seconds === 0 && (r.minutes > 0 || r.hours > 0 || r.days > 0)) {
      announce(ARIA_HOURS(r.days, r.hours));
    }

    if (now >= targetDate) {
      clearInterval(intervalId);
    }
  }

  if (targetDate) {
    tick();
    intervalId = setInterval(tick, 1000);
  } else {
    valueEls.forEach((el) => { el.textContent = '00'; });
  }
}
