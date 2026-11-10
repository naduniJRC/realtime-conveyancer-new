// GSAP libraries must load before this file (see index.html).
(() => {
  const hero = document.querySelector('.hero');
  const panel = document.querySelector('.media-placeholder');
  const video = document.querySelector('.hero-video');
  const toggle = document.querySelector('.video-toggle');
  if (!hero || !panel || !video) return;
  let userPaused = false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const syncButton = () => {
    if (!toggle) return;
    toggle.textContent = video.paused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
  };
  video.addEventListener('play', syncButton);
  video.addEventListener('pause', syncButton);
  toggle?.addEventListener('click', () => {
    if (video.paused) { userPaused = false; video.play().catch(syncButton); }
    else { userPaused = true; video.pause(); }
  });
  if (reduced.matches) video.pause();
  else video.play().catch(syncButton);
  const visibility = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) video.pause();
    else if (!userPaused && !reduced.matches) video.play().catch(syncButton);
  }, { threshold: 0.05 });
  visibility.observe(hero);
  const scenes = [
    { start: 0,     end: 5.98,  main: "Built by conveyancers.", accent: "For conveyancers." },
    { start: 5.98,  end: 11.94, main: "Keep your team",         accent: "connected." },
    { start: 11.94, end: 17.9,  main: "Keep your clients",      accent: "in the loop." },
    { start: 17.9,  end: 23.88, main: "Less admin.",            accent: "More progress." },
    { start: 23.88, end: 29.84, main: "More time",              accent: "for what matters." },
    { start: 29.84, end: 32.9,  main: "Move forward",           accent: "together." },
    { start: 32.9,  end: 38.88, main: "Your expertise.",        accent: "Powered by Realtime." },
  ];
  const captionTitle = panel.querySelector('[data-scene-title]');
  let currentScene = -1;
  function applyScene(idx) {
    if (captionTitle) {
      captionTitle.replaceChildren();
      captionTitle.appendChild(document.createTextNode(scenes[idx].main));
      const em = document.createElement('em');
      em.textContent = scenes[idx].accent;
      captionTitle.appendChild(em);
    }
  }
  function updateScene() {
    if (!captionTitle) return;
    const t = video.currentTime;
    const idx = scenes.findIndex(s => t >= s.start && t < s.end);
    if (idx === -1 || idx === currentScene) return;
    if (currentScene === -1) { currentScene = idx; applyScene(idx); return; }
    currentScene = idx;
    captionTitle.classList.add('is-leaving');
    setTimeout(() => { applyScene(idx); captionTitle.classList.remove('is-leaving'); }, 260);
  }
  video.addEventListener('timeupdate', updateScene);
  video.addEventListener('seeked', updateScene);
  video.addEventListener('loadedmetadata', updateScene);
  updateScene();
  if (!window.gsap || !window.ScrollTrigger) {
    console.warn('GSAP files are missing. Check js/vendor paths.');
    syncButton(); return;
  }
  gsap.registerPlugin(ScrollTrigger);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    panel.classList.add('captions-hidden');
  }
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: hero, start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * 1.3),
        pin: true, scrub: 0.6, anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => panel.classList.toggle('captions-hidden', self.progress < 0.85)
      }
    });
    timeline.to(hero.querySelector('h1'), { scale: 0.58, y: -25, autoAlpha: 0, duration: 0.55, ease: 'none' }, 0)
      .to(hero.querySelector('.eyebrow'), {autoAlpha:0, duration:0.25, ease:'none'},0)
      .to(hero.querySelector('.intro'), {autoAlpha:0, y:-15, duration:0.3, ease:'none'},0)
      .to(hero.querySelector('.scroll-cue'), {autoAlpha:0, y:10, duration:0.25, ease:'none'},0)
      .fromTo(panel, {left:()=>innerWidth<=700?'5%':'52%', top:()=>innerWidth<=700?'61%':'55%', width:()=>innerWidth<=700?'90%':'44%', height:()=>innerWidth<=700?'30%':'36%', borderRadius:8,borderWidth:1}, { left: '0%', top: '0%', width: '100%', height: '100%', borderRadius: 0, borderWidth:0, duration: 1, ease: 'none', immediateRender:false }, 0)
      .to({}, {duration:0.25});
    return () => { timeline.kill(); panel.classList.remove('captions-hidden'); };
  });
  window.addEventListener('load', () => ScrollTrigger.refresh(), {once:true});
  syncButton();
})();


/* Presentation edition: navigation and progressive motion enhancements. */
(() => {
  const header = document.querySelector('#site-header');
  const menu = document.querySelector('#site-menu');
  const opener = document.querySelector('.menu-button');
  const closeButton = document.querySelector('.menu-close');
  let previousOverflow = '';
  function closeMenu() { if(menu.open) menu.close(); }
  opener.addEventListener('click', () => {
    previousOverflow = document.body.style.overflow;
    menu.showModal();
    document.body.style.overflow = 'hidden';
    opener.setAttribute('aria-expanded','true');
    closeButton.focus();
    if(window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(menu.querySelectorAll('nav a'), {y:25,opacity:0}, {y:0,opacity:1,duration:.5,stagger:.06,clearProps:'transform,opacity'});
    }
  });
  closeButton.addEventListener('click',closeMenu);
  menu.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',closeMenu));
  menu.addEventListener('close',()=>{
    document.body.style.overflow=previousOverflow;
    opener.setAttribute('aria-expanded','false');
    opener.focus({preventScroll:true});
  });
  let ticking=false;
  const updateHeader=()=>{header.classList.toggle('is-compact',window.scrollY>window.innerHeight*0.85);ticking=false;};
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateHeader);ticking=true;}},{passive:true});
  updateHeader();
  document.querySelector('#footer-year').textContent=new Date().getFullYear();
})();

(() => {
  const root = document.querySelector('[data-platform-hero]');
  if (!root) return;
  const tabs = [...root.querySelectorAll('[data-tab]')];
  const webScreens = [...root.querySelectorAll('[data-screen]')];
  const phoneScreens = [...root.querySelectorAll('[data-phone]')];
  const currentTitle = root.querySelector('[data-current-title]');
  const titles = ['Matter overview', 'Workflows', 'Documents'];
  const CYCLE_MS = 4500;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer = null;
  let startAt = 0;
  let frame = null;
  function setProgress(index, pct) {
    if (!tabs[index]) return;
    const bar = tabs[index].querySelector('.tab-progress');
    if (bar) bar.style.width = pct + '%';
  }
  function resetAllProgress() { tabs.forEach((_, i) => setProgress(i, 0)); }
  function activate(i) {
    current = i;
    tabs.forEach((t, idx) => {
      t.classList.toggle('is-active', idx === i);
      t.setAttribute('aria-selected', idx === i);
      if (idx !== i) setProgress(idx, 0);
    });
    webScreens.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    phoneScreens.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    if (currentTitle) currentTitle.textContent = titles[i];
  }
  function tick() {
    const el = Date.now() - startAt;
    const pct = Math.min(100, (el / CYCLE_MS) * 100);
    setProgress(current, pct);
    if (el >= CYCLE_MS) {
      const total = tabs.length || webScreens.length;
      activate((current + 1) % total);
      startAt = Date.now();
    }
    frame = requestAnimationFrame(tick);
  }
  function start() {
    if (reduced.matches) return;
    cancelAnimationFrame(frame);
    startAt = Date.now();
    frame = requestAnimationFrame(tick);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = null;
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => { resetAllProgress(); activate(i); startAt = Date.now(); });
  });
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) start(); else stop();
  }, { threshold: 0.2 });
  io.observe(root);
  const trackerBars = root.closest('.platform-inner').querySelector('[data-tracker-bars]');
  const containers = root.closest('.platform-inner').querySelectorAll('[data-particles]');
  if (containers.length) {
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
    const mk = (x, y, colors) => {
      const big = rnd();
      return { x: x.toFixed(2), y: y.toFixed(2), s: big < 0.15 ? 3 : (big < 0.55 ? 2 : 1.5), c: colors[Math.floor(rnd() * colors.length)], o: (0.4 + rnd() * 0.6).toFixed(2), k: Math.floor(rnd() * 6), dur: (3 + rnd() * 5).toFixed(1), delay: (-rnd() * 8).toFixed(1) };
    };
    const inBox = (x, y) => x > -4 && x < 104 && y > -4 && y < 104;
    const pink = ['#E58BB6', '#D46BA3', '#F2B8D2', '#9DB8E0', '#FCC8DE'];
    const blue = ['#7FA3D6', '#A9C1E2', '#4F78B5', '#2E5A96', '#C6D9EF'];
    const green = ['#7AC143', '#A6D97F', '#4C9A1D', '#C9E8AC', '#7FA3D6'];
    // 1) Workflows: rising-curve trajectory (lower-left → upper-right with arc)
    const p1 = [];
    for (let i = 0; i < 480; i++) {
      const t = rnd();
      const cx = 10 + t * 86;
      const cy = 86 - t * 72 - Math.sin(t * Math.PI * 1.15) * 10;
      const dx = 86;
      const dy = -72 - Math.cos(t * Math.PI * 1.15) * Math.PI * 1.15 * 10;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len, ny = dx / len;
      const bandW = 5 + 6 * Math.sin(t * Math.PI);
      const n = gauss() * bandW;
      const x = cx + nx * n + gauss() * 1.5;
      const y = cy + ny * n + gauss() * 1.5;
      if (inBox(x, y)) p1.push(mk(x, y, pink));
    }
    // 2) Documents: three overlapping rectangle outlines (stacked files)
    const p2 = [];
    const rects = [
      { x: 10, y: 20, w: 56, h: 40 },
      { x: 22, y: 32, w: 56, h: 40 },
      { x: 34, y: 44, w: 56, h: 40 }
    ];
    rects.forEach((rc, idx) => {
      const perim = (rc.w + rc.h) * 2;
      const count = 170 - idx * 20;
      for (let i = 0; i < count; i++) {
        const d = rnd() * perim;
        let px, py;
        if (d < rc.w) { px = rc.x + d; py = rc.y; }
        else if (d < rc.w + rc.h) { px = rc.x + rc.w; py = rc.y + (d - rc.w); }
        else if (d < rc.w * 2 + rc.h) { px = rc.x + rc.w - (d - rc.w - rc.h); py = rc.y + rc.h; }
        else { px = rc.x; py = rc.y + rc.h - (d - rc.w * 2 - rc.h); }
        const x = px + gauss() * 2.5;
        const y = py + gauss() * 2.5;
        if (inBox(x, y)) p2.push(mk(x, y, blue));
      }
    });
    // Light fill scatter inside the top rect to suggest content
    for (let i = 0; i < 60; i++) {
      const x = 15 + rnd() * 50, y = 25 + rnd() * 30;
      if (rnd() < 0.5) p2.push(mk(x + gauss() * 2, y + gauss() * 2, blue));
    }
    // 3) Passcode: concentric rings (signal radiating from center)
    const p3 = [];
    const cx3 = 50, cy3 = 52;
    const rings = [16, 26, 36, 48];
    rings.forEach((radius, idx) => {
      const count = 90 + idx * 35;
      for (let i = 0; i < count; i++) {
        const a = rnd() * Math.PI * 2;
        const rN = gauss() * 2.2;
        const x = cx3 + Math.cos(a) * (radius + rN);
        const y = cy3 + Math.sin(a) * (radius + rN);
        if (inBox(x, y)) p3.push(mk(x, y, green));
      }
    });
    // Center cluster
    for (let i = 0; i < 40; i++) {
      const a = rnd() * Math.PI * 2, r = rnd() * 7;
      p3.push(mk(cx3 + Math.cos(a) * r, cy3 + Math.sin(a) * r, green));
    }
    const sets = { pink: p1, blue: p2, green: p3 };
    containers.forEach(c => {
      const list = sets[c.dataset.particles];
      if (!list) return;
      c.innerHTML = list.map(p =>
        `<span class="pw" style="left:${p.x}%;top:${p.y}%;opacity:${p.o}"><span class="pd" style="width:${p.s}px;height:${p.s}px;background:${p.c};animation:rtS${p.k} ${p.dur}s ease-in-out ${p.delay}s infinite"></span></span>`
      ).join('');
    });
  }
  if (trackerBars) {
    for (let i = 0; i < 10; i++) {
      const b = document.createElement('span');
      b.className = 'tracker-bar';
      trackerBars.appendChild(b);
    }
    const bars = [...trackerBars.querySelectorAll('.tracker-bar')];
    const steps = [
      { n: 2, name: 'Meet your conveyancer' },
      { n: 4, name: 'Sign initial documents' },
      { n: 5, name: 'Sale unconditional' },
      { n: 6, name: 'ID check ready' },
      { n: 7, name: 'ID check successful' }
    ];
    const stepN = root.closest('.platform-inner').querySelector('[data-step-n]');
    const stepName = root.closest('.platform-inner').querySelector('[data-step-name]');
    let si = 1;
    function applyStep(idx) {
      const s = steps[idx];
      if (stepN) stepN.textContent = s.n;
      if (stepName) stepName.textContent = s.name;
      bars.forEach((bar, i) => {
        bar.classList.remove('is-done', 'is-current');
        if (i < s.n - 1) bar.classList.add('is-done');
        else if (i === s.n - 1) bar.classList.add('is-current');
      });
    }
    applyStep(si);
    setInterval(() => {
      si = (si + 1) % steps.length;
      applyStep(si);
    }, 2500);
  }
})();

(() => {
  document.querySelectorAll('[data-audience-slider]').forEach(track => {
    const cards = [...track.querySelectorAll('.audience-card')];
    const dotsWrap = track.parentElement.querySelector('[data-audience-dots]');
    const canHover = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 821px)');
    const dots = [];
    function activate(i) {
      cards.forEach((card, n) => {
        const on = n === i;
        card.classList.toggle('is-active', on);
        card.setAttribute('aria-expanded', on);
        const cta = card.querySelector('.audience-card-cta');
        if (cta) cta.tabIndex = on ? 0 : -1;
        if (dots[n]) dots[n].setAttribute('aria-current', on);
      });
    }
    cards.forEach((card, i) => {
      const label = card.querySelector('.audience-card-label');
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Show ' + (label ? label.textContent.toLowerCase() : 'section'));
      card.addEventListener('click', (e) => {
        if (!card.classList.contains('is-active') && !e.target.closest('.audience-card-cta')) {
          e.preventDefault();
          activate(i);
        }
      });
      card.addEventListener('mouseenter', () => { if (canHover.matches) activate(i); });
      card.addEventListener('keydown', (e) => {
        if (e.target !== card) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(i); }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); const n = (i + 1) % cards.length; cards[n].focus(); activate(n); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); const p = (i - 1 + cards.length) % cards.length; cards[p].focus(); activate(p); }
      });
      if (dotsWrap) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'audience-dot';
        dot.setAttribute('aria-label', 'Show ' + (label ? label.textContent.toLowerCase() : 'card ' + (i + 1)));
        dot.addEventListener('click', () => activate(i));
        dotsWrap.appendChild(dot);
        dots.push(dot);
      }
    });
    const start = cards.findIndex(c => c.classList.contains('is-active'));
    activate(start < 0 ? 0 : start);
  });
})();

(() => {
  const section = document.querySelector('.backbone');
  if (!section) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stats = [...section.querySelectorAll('.backbone-stat')];
  const bars = [...section.querySelectorAll('.backbone-bar')];
  let activeStat = 0;
  function renderStats() {
    stats.forEach((s, i) => s.classList.toggle('is-active', i === activeStat));
    bars.forEach(b => { b.style.left = (activeStat * 25) + '%'; });
  }
  if (stats.length) {
    renderStats();
    if (!reduced) setInterval(() => { activeStat = (activeStat + 1) % stats.length; renderStats(); }, 3200);
  }
  const rayWrap = section.querySelector('[data-backbone-rays]');
  if (!rayWrap) return;
  const RAY_COUNT = 280;
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  function mix(a, b, t) {
    const h = (c) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
    const A = h(a), B = h(b);
    return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')';
  }
  const rayData = [];
  const frag = document.createDocumentFragment();
  const scale = window.innerWidth < 760 ? 0.7 : 1;
  for (let i = 0; i < RAY_COUNT; i++) {
    const u = rnd() * 2 - 1;
    const ang = Math.sign(u) * Math.pow(Math.abs(u), 0.85) * 84;
    const c = Math.cos(ang * Math.PI / 180);
    const len = Math.min(680, Math.round((300 + rnd() * 420) * (0.72 + 0.3 * c))) * scale;
    const v = Math.abs(ang) / 84;
    const tip = v < 0.5 ? mix('#FFFFFF', '#E8EAFF', v * 2) : mix('#E8EAFF', '#C8CEFF', (v - 0.5) * 2);
    const dotSize = rnd() < 0.03 ? 5 : (rnd() < 0.15 ? 3 : 2);
    const dur = (2.6 + rnd() * 3.4).toFixed(1), delay = (-rnd() * 6).toFixed(1);
    const ray = document.createElement('div');
    ray.className = 'backbone-ray';
    ray.style.height = len + 'px';
    ray.style.transform = 'rotate(' + ang.toFixed(2) + 'deg)';
    const sway = document.createElement('div');
    sway.className = 'backbone-ray-sway';
    const grow = document.createElement('div');
    grow.className = 'backbone-ray-grow';
    const line = document.createElement('span');
    line.className = 'backbone-ray-line';
    line.style.width = (rnd() < 0.05 ? 1.5 : 1) + 'px';
    line.style.background = 'linear-gradient(to top, rgba(42,46,143,0.1), ' + tip + ')';
    line.style.opacity = (0.35 + rnd() * 0.5).toFixed(2);
    const dot = document.createElement('span');
    dot.className = 'backbone-ray-dot';
    dot.style.width = dot.style.height = dotSize + 'px';
    dot.style.marginTop = -(dotSize / 2) + 'px';
    dot.style.background = tip;
    dot.style.opacity = (0.6 + rnd() * 0.4).toFixed(2);
    dot.style.transform = 'translateX(-50%)';
    if (!reduced) {
      sway.style.animation = (rnd() < 0.5 ? 'backboneSwayA' : 'backboneSwayB') + ' ' + (6 + rnd() * 6).toFixed(1) + 's ease-in-out ' + (-rnd() * 10).toFixed(1) + 's infinite';
      grow.style.animation = 'backboneGrow ' + dur + 's ease-in-out ' + delay + 's infinite alternate';
      dot.style.animation = 'backboneTip ' + dur + 's ease-in-out ' + delay + 's infinite';
    }
    grow.appendChild(line);
    grow.appendChild(dot);
    sway.appendChild(grow);
    ray.appendChild(sway);
    frag.appendChild(ray);
    rayData.push({ el: ray, ang: ang, len: len });
  }
  rayWrap.appendChild(frag);
  const burst = rayWrap.closest('.backbone-burst');
  let pending = null, rafId = null;
  function applyMouse(m) {
    rayData.forEach(r => {
      let rot = r.ang, h = r.len;
      if (m) {
        const diff = m.ang - r.ang;
        const prox = Math.exp(-Math.pow(diff / 30, 2));
        const near = Math.max(0, 1 - Math.abs(m.dist - r.len) / 450);
        rot = r.ang + diff * 0.35 * prox;
        h = r.len * (1 + 0.2 * prox * (0.5 + 0.5 * near));
      }
      r.el.style.transform = 'rotate(' + rot.toFixed(2) + 'deg)';
      r.el.style.height = Math.round(h) + 'px';
    });
  }
  if (burst && !reduced) {
    burst.addEventListener('pointermove', (e) => {
      const rect = burst.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = rect.height - (e.clientY - rect.top);
      pending = { ang: Math.atan2(x, Math.max(y, 1)) * 180 / Math.PI, dist: Math.hypot(x, y) };
      if (!rafId) rafId = requestAnimationFrame(() => { rafId = null; applyMouse(pending); });
    });
    burst.addEventListener('pointerleave', () => { pending = null; applyMouse(null); });
  }
})();

(() => {
  const stage = document.querySelector('[data-reviews]');
  if (!stage) return;
  const section = stage.closest('.reviews');
  const slides = [...stage.querySelectorAll('.review-slide')];
  const dots = [...section.querySelectorAll('.review-dot')];
  const count = slides.length;
  const AUTO_MS = 8000;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer = null;
  let hovered = false;
  let focused = false;
  let offScreen = false;
  const canRotate = () => !hovered && !focused && !offScreen && !reduced.matches;
  let exitTimer = null;
  function activate(index, direction = 'next') {
    if (index === current) return;
    const old = current;
    stage.dataset.direction = direction;
    slides[old].classList.add('is-exiting');
    slides[old].classList.remove('is-active');
    dots[old].classList.remove('is-active');
    dots[old].setAttribute('aria-selected', 'false');
    current = index;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-selected', 'true');
    clearTimeout(exitTimer);
    exitTimer = setTimeout(() => {
      slides.forEach(s => s.classList.remove('is-exiting'));
    }, 900);
  }
  function cycle() {
    clearTimeout(timer);
    if (!canRotate()) return;
    timer = setTimeout(() => {
      activate((current + 1) % count, 'next');
      cycle();
    }, AUTO_MS);
  }
  function stop() { clearTimeout(timer); timer = null; }
  function goTo(index) {
    const direction = (index > current || (index === 0 && current === count - 1)) ? 'next' : 'prev';
    activate(index, direction);
    stop();
    cycle();
  }
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
    dot.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % count;
      else if (e.key === 'ArrowLeft') next = (i - 1 + count) % count;
      if (next !== null) { e.preventDefault(); dots[next].focus(); goTo(next); }
    });
  });
  let touchStartX = 0;
  let touchStartY = 0;
  let touchActive = false;
  stage.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    touchActive = true;
  }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (!touchActive) return;
    touchActive = false;
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) activate((current + 1) % count, 'next');
    else activate((current - 1 + count) % count, 'prev');
    stop(); cycle();
  }, { passive: true });
  section.addEventListener('focusin', () => { focused = true; stop(); });
  section.addEventListener('focusout', (e) => {
    if (!section.contains(e.relatedTarget)) { focused = false; cycle(); }
  });
  const io = new IntersectionObserver(entries => {
    offScreen = !entries[0].isIntersecting;
    if (offScreen) stop(); else cycle();
  }, { threshold: 0.3 });
  io.observe(section);
  cycle();
})();

(() => {
  const stage=document.querySelector('.cap-stage');
  const scenes=[...document.querySelectorAll('[data-scene]')];
  const copies=[...document.querySelectorAll('[data-copy]')];
  const tabs=[...document.querySelectorAll('[data-chapter]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let active=0, stageTrigger=null;
  function activate(index,animate=true){
    const changed=index!==active;
    active=index;
    scenes.forEach((el,i)=>el.classList.toggle('active',i===index));
    copies.forEach((el,i)=>el.classList.toggle('active',i===index));
    tabs.forEach((el,i)=>{el.classList.toggle('active',i===index);el.setAttribute('aria-pressed',String(i===index));});
    document.querySelector('.cap-number').textContent=`0${index+1} — 03`;
    if(changed && animate && window.gsap && !reduced.matches){
      gsap.fromTo(copies[index],{y:16,opacity:0},{y:0,opacity:1,duration:.45,overwrite:true,clearProps:'transform,opacity'});
      gsap.fromTo(scenes[index],{y:22,opacity:0,scale:.96},{y:0,opacity:1,scale:1,duration:.55,overwrite:true,clearProps:'transform,opacity'});
      if(index===1) gsap.fromTo('.ring-segments',{rotation:-35},{rotation:0,duration:1.1,ease:'power3.out',overwrite:true});
      if(index===2) gsap.fromTo('.bar-group',{scaleY:.1},{scaleY:1,duration:.85,stagger:.1,ease:'power3.out',overwrite:true});
    }
  }
  tabs.forEach((button,i)=>button.addEventListener('click',()=>{
    if(stageTrigger && !reduced.matches){
      const dest=stageTrigger.start+(stageTrigger.end-stageTrigger.start)*((i+.45)/3);
      window.scrollTo({top:dest,behavior:'smooth'});
    } else activate(i);
  }));
  if(!window.gsap||!window.ScrollTrigger||reduced.matches)return;
  gsap.registerPlugin(ScrollTrigger);
  const mm=gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)',()=>{
    gsap.utils.toArray('.reveal').forEach(el=>{
      gsap.from(el,{y:45,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 94%',once:true}});
    });
    const ecosystem=document.querySelector('.ecosystem');
    if(ecosystem){
      gsap.from(ecosystem,{y:40,duration:1,ease:'power3.out',scrollTrigger:{trigger:ecosystem,start:'top 92%',once:true}});
      gsap.from('.logo-strip img',{y:14,duration:.5,stagger:.05,ease:'power2.out',clearProps:'transform',scrollTrigger:{trigger:'.logo-strip',start:'top 90%',once:true}});
    }
    gsap.fromTo('.orbit-lines',{rotation:-18,scale:.85},{rotation:20,scale:1.07,ease:'none',transformOrigin:'500px 220px',scrollTrigger:{trigger:'.about-orbit',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.fromTo('.architecture-lines',{rotation:-8,x:15},{rotation:8,x:-10,ease:'none',scrollTrigger:{trigger:'.tile-architecture',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.fromTo('.ring-a',{rotationZ:-25},{rotationZ:35,ease:'none',scrollTrigger:{trigger:'.tile-detail',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.fromTo('.ring-b',{rotationZ:30},{rotationZ:-45,ease:'none',scrollTrigger:{trigger:'.tile-detail',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.from('.process-rule',{scaleX:0,ease:'none',scrollTrigger:{trigger:'.process-track',start:'top 85%',end:'bottom 50%',scrub:1}});
    gsap.fromTo('.film-cross',{rotation:0},{rotation:90,ease:'none',scrollTrigger:{trigger:'.film-slot',start:'top bottom',end:'bottom top',scrub:1}});
  });
  mm.add('(min-width: 651px) and (prefers-reduced-motion: no-preference)',()=>{
    stageTrigger=ScrollTrigger.create({trigger:stage,start:'top top',end:()=>'+='+Math.round(innerHeight*2.1),pin:true,anticipatePin:1,invalidateOnRefresh:true,onUpdate:self=>{
      activate(Math.min(2,Math.floor(self.progress*3)));
      gsap.set('.stage-progress span',{scaleX:Math.max(.03,self.progress*3)});
    }});
    const line=document.querySelector('.signal-line');
    const lineLength=line.getTotalLength();
    gsap.fromTo(line,{strokeDasharray:lineLength,strokeDashoffset:lineLength},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:stage,start:()=>stageTrigger.start-innerHeight*.25,end:()=>stageTrigger.start+(stageTrigger.end-stageTrigger.start)/3,scrub:.7}});
    gsap.utils.toArray('.ring-segments .ring-piece').forEach((piece,i)=>{
      const angle=(i*30+14.5)*Math.PI/180;
      gsap.fromTo(piece,{x:0,y:0},{x:Math.cos(angle)*22,y:Math.sin(angle)*22,ease:'none',scrollTrigger:{trigger:stage,start:()=>stageTrigger.start+(stageTrigger.end-stageTrigger.start)/3,end:()=>stageTrigger.start+(stageTrigger.end-stageTrigger.start)*2/3,scrub:.7}});
    });
    gsap.fromTo('.chart-cursor',{opacity:.25},{opacity:1,ease:'none',scrollTrigger:{trigger:stage,start:()=>stageTrigger.start-innerHeight*.3,end:()=>stageTrigger.start+(stageTrigger.end-stageTrigger.start)/3,scrub:.7}});
    return()=>{stageTrigger=null;activate(0,false);};
  });
  mm.add('(max-width: 650px) and (prefers-reduced-motion: no-preference)',()=>{
    scenes.forEach((scene,i)=>{ScrollTrigger.create({trigger:scene,start:'top 65%',end:'bottom 35%',onEnter:()=>activate(i,false),onEnterBack:()=>activate(i,false)});});
  });
  addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
})();

/* ---------- Awards (medal wall) ---------- */
(()=>{
  const section=document.querySelector('.aw.mw');if(!section)return;
  const targets=section.querySelectorAll('.rv, [data-reveal]');
  if(targets.length){
    const io=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
    },{threshold:.01,rootMargin:'0px 0px -5% 0px'});
    targets.forEach(t=>io.observe(t));
  }
  setTimeout(()=>targets.forEach(t=>t.classList.add('in')),1500);
  const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(fine){
    section.querySelectorAll('.mw-item').forEach(item=>{
      const face=item.querySelector('.mw-face');if(!face)return;
      item.addEventListener('pointermove',(e)=>{
        const r=face.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        face.style.setProperty('--ry',(x*28).toFixed(1)+'deg');
        face.style.setProperty('--rx',(-y*28).toFixed(1)+'deg');
      });
      item.addEventListener('pointerleave',()=>{
        face.style.setProperty('--ry','0deg');
        face.style.setProperty('--rx','0deg');
      });
    });
  }
})();

/* ---------- Feature sections: shared .rv scroll reveal ---------- */
(()=>{
  const nodes=document.querySelectorAll('.feature-story .rv, .feature-story [data-reveal], .feature-rows .rv, .feature-rows [data-reveal]');
  if(!nodes.length)return;
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:.05,rootMargin:'0px 0px -10% 0px'});
  nodes.forEach(n=>io.observe(n));
})();

/* ---------- Feature Story (sticky scroll, morphing preview) ---------- */
(()=>{
  const section=document.querySelector('.feature-story');if(!section)return;
  const items=[...section.querySelectorAll('.story-item')];
  const panels=[...section.querySelectorAll('.stage-panel')];
  const countEl=section.querySelector('[data-count]');
  const bar=section.querySelector('.stage-bar');
  const total=items.length;if(!total)return;
  const activate=(idx)=>{
    items.forEach((it,i)=>it.classList.toggle('on',i===idx));
    panels.forEach((p,i)=>p.classList.toggle('on',i===idx));
    if(countEl)countEl.textContent=String(idx+1).padStart(2,'0');
    if(bar)bar.style.setProperty('--p',(((idx+1)/total)*100)+'%');
  };
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){const i=items.indexOf(e.target);if(i>=0)activate(i);}});
  },{rootMargin:'-45% 0px -45% 0px',threshold:0});
  items.forEach(it=>io.observe(it));
  activate(0);
})();

/* ---------- Feature Rows (expanding with sweep fill) ---------- */
(()=>{
  const wrap=document.querySelector('[data-rows]');if(!wrap)return;
  const rows=[...wrap.querySelectorAll('.row')];
  const open=(row)=>{
    rows.forEach(r=>{
      const isTarget=r===row;
      r.classList.toggle('open',isTarget);
      const btn=r.querySelector('.row-btn');
      if(btn)btn.setAttribute('aria-expanded',isTarget?'true':'false');
    });
  };
  rows.forEach(row=>{
    const btn=row.querySelector('.row-btn');
    if(btn)btn.addEventListener('click',()=>open(row));
  });
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    rows.forEach(row=>row.addEventListener('mouseenter',()=>open(row)));
  }
})();
