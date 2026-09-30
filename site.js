// Pulse website: parallax, scroll moments, and the "hold to talk" demo.
// Everything here is decoration; the page reads fine without it.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------------------------------------------------------- stars */
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (const sky of $$('[data-stars]')) {
    const n = Number(sky.dataset.stars) || 50;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      const big = rand() > 0.85;
      s.style.cssText = `left:${(rand() * 100).toFixed(2)}%;top:${(rand() * 100).toFixed(2)}%;animation-delay:${(-rand() * 4).toFixed(2)}s;${big ? 'width:3px;height:3px;box-shadow:0 0 6px #b8a6ff;' : ''}opacity:${(0.25 + rand() * 0.6).toFixed(2)}`;
      frag.appendChild(s);
    }
    sky.appendChild(frag);
  }

  /* ---------------------------------------------------------- nav */
  const nav = $('#nav');
  const onScrollNav = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ---------------------------------------------------------- reveal on scroll */
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------------------------------------------------------- the dying group chat */
  const chat = $('#chat');
  if (chat) {
    new IntersectionObserver(
      (entries, obs) => {
        if (!entries[0].isIntersecting) return;
        chat.classList.add('play');
        if (!reduce) setTimeout(() => chat.classList.add('dead'), 4600);
        obs.disconnect();
      },
      { threshold: 0.45 },
    ).observe(chat);
  }

  /* ---------------------------------------------------------- "Pulse is not" strike-throughs */
  const lines = $$('#notlines > div');
  if (lines.length) {
    new IntersectionObserver(
      (entries, obs) => {
        if (!entries[0].isIntersecting) return;
        lines.forEach((l, i) => setTimeout(() => l.classList.add('struck'), reduce ? 0 : 350 + i * 520));
        obs.disconnect();
      },
      { threshold: 0.5 },
    ).observe($('#notlines'));
  }

  /* ---------------------------------------------------------- how it works: sticky phone */
  const steps = $$('.step');
  const shots = $$('.sticky .shot');
  const pips = $$('.sticky-pips .pip');
  const says = $$('.sticky-say .bubble');
  const rail = $('.rail i');
  let active = -1;
  const setStep = (i) => {
    if (i === active) return;
    active = i;
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    shots.forEach((s, k) => s.classList.toggle('on', k === i));
    pips.forEach((s, k) => s.classList.toggle('on', k === i));
    says.forEach((s, k) => s.classList.toggle('on', k === i));
  };
  if (steps.length) {
    setStep(0);
    const stepIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setStep(Number(e.target.dataset.step));
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    steps.forEach((s) => stepIO.observe(s));
  }

  /* ---------------------------------------------------------- parallax */
  const layers = $$('[data-depth]').map((el) => ({ el, depth: Number(el.dataset.depth), host: el.closest('section') ?? document.body }));
  const hero = $('.hero');
  let mx = 0;
  let my = 0;
  let sx = 0;
  let sy = 0;
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener(
      'pointermove',
      (e) => {
        mx = e.clientX / window.innerWidth - 0.5;
        my = e.clientY / window.innerHeight - 0.5;
        if (hero) {
          hero.style.setProperty('--mx', `${e.clientX}px`);
          hero.style.setProperty('--my', `${e.clientY}px`);
        }
      },
      { passive: true },
    );
  }
  const stepsBox = $('#steps');
  const frame = () => {
    sx += (mx - sx) * 0.07;
    sy += (my - sy) * 0.07;
    const vh = window.innerHeight;
    for (const l of layers) {
      const r = l.host.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      // How far the section has moved from where it sits when it's in view
      // (for the first screen: from the top of the page).
      const off = l.host.offsetTop < vh ? r.top : r.top + r.height / 2 - vh / 2;
      const y = Math.max(-90, Math.min(90, -off * l.depth * 0.25)) + sy * l.depth * 40;
      const x = sx * l.depth * 40;
      l.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
    if (rail && stepsBox) {
      const r = stepsBox.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh / 2 - r.top) / r.height));
      rail.style.height = `${(p * 100).toFixed(1)}%`;
    }
    requestAnimationFrame(frame);
  };
  if (!reduce) requestAnimationFrame(frame);

  /* ---------------------------------------------------------- hold-to-talk demo */
  const hold = $('#hold');
  const say = $('.demo .say');
  const strip = $('#strip');
  const result = $('#result');
  const again = $('#again');
  if (hold && say && strip && result) {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      days.push(d);
      const el = document.createElement('div');
      el.innerHTML = `${d.toLocaleDateString('en-US', { weekday: 'narrow' })}<b>${d.getDate()}</b>`;
      strip.appendChild(el);
    }
    const PHRASES = [
      { text: 'down for food this afternoon', day: 0, chip: ['coffee', 'Eat', 'Today · afternoon'], friend: ['MC', '#c8f24a', 'Maya’s down too', 'Food · 2–5 PM'] },
      { text: 'down to run saturday morning', day: 6 - now.getDay(), chip: ['activity', 'Move', 'Sat · morning'], friend: ['RP', '#f5a28f', 'Ryan’s really trying', 'Run · 8–10 AM'] },
      { text: 'study sesh tomorrow after class', day: 1, chip: ['book-open', 'Productive', 'Tomorrow · after class'], friend: ['PS', '#f2c94c', 'Priya overlaps', 'Study · 3–6 PM'] },
    ];
    const ICONS = {
      coffee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
      activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
      'book-open': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    };
    let turn = 0;
    let typing = null;
    let state = 'idle';
    const reset = () => {
      clearInterval(typing);
      state = 'idle';
      hold.classList.remove('on');
      say.innerHTML = '<span class="hint">Press and hold the circle</span>';
      result.innerHTML = '';
      $$('div', strip).forEach((d) => d.classList.remove('lit'));
      again.classList.remove('show');
    };
    const start = (e) => {
      if (e) e.preventDefault();
      if (state !== 'idle') return;
      state = 'listening';
      hold.classList.add('on');
      const phrase = PHRASES[turn % PHRASES.length];
      let i = 0;
      say.innerHTML = '<span class="words"></span><span class="caret"></span>';
      const words = $('.words', say);
      typing = setInterval(() => {
        i += 1;
        words.textContent = `“${phrase.text.slice(0, i)}`;
        if (i >= phrase.text.length) {
          clearInterval(typing);
          words.textContent = `“${phrase.text}”`;
          finish();
        }
      }, reduce ? 0 : 38);
    };
    const finish = () => {
      if (state !== 'listening') return;
      state = 'done';
      clearInterval(typing);
      const phrase = PHRASES[turn % PHRASES.length];
      turn += 1;
      hold.classList.remove('on');
      const words = $('.words', say);
      if (words) words.textContent = `“${phrase.text}”`;
      $('.caret', say)?.remove();
      const cells = $$('div', strip);
      cells[Math.min(phrase.day, 6)].classList.add('lit');
      const [icon, label, when] = phrase.chip;
      const [ini, color, who, what] = phrase.friend;
      result.innerHTML = `<div class="chip light"><span class="ic">${ICONS[icon]}</span><span>${label}<small>${when}</small></span></div><div class="chip light"><span class="av" style="background:${color}">${ini}</span><span>${who}<small>${what}</small></span></div>`;
      const chips = $$('.chip', result);
      chips.forEach((c, k) => setTimeout(() => c.classList.add('in'), reduce ? 0 : 150 + k * 450));
      setTimeout(() => again.classList.add('show'), reduce ? 0 : 1200);
    };
    hold.addEventListener('pointerdown', start);
    hold.addEventListener('pointerup', finish);
    hold.addEventListener('pointerleave', finish);
    hold.addEventListener('contextmenu', (e) => e.preventDefault());
    hold.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
        start(e);
        setTimeout(finish, 1400);
      }
    });
    again.addEventListener('click', reset);
  }
})();
