/* ÆGENTES — front-of-house interactions.
   Everything re-initialises on astro:page-load so view transitions stay smooth. */

const FLAP_CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ&';
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** layout-viewport height; 0 means the environment can't tell us */
const viewportH = () =>
  Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);

let cleanups: Array<() => void> = [];
const onCleanup = (fn: () => void) => cleanups.push(fn);

/* ---- split-flap mechanism ---------------------------------------------- */
function initFlaps() {
  document.querySelectorAll<HTMLElement>('[data-flap]').forEach((board) => {
    if (board.dataset.flapInit) return;
    board.dataset.flapInit = '1';
    const words: string[] = JSON.parse(board.dataset.words ?? '[]');
    if (words.length < 2) return;
    const interval = Number(board.dataset.interval ?? 2700);
    const cells = [...board.querySelectorAll<HTMLElement>('.cell')];
    const cols = cells.length;
    const pad = (w: string) => w.padEnd(cols, ' ').slice(0, cols);

    let wordIdx = 0;
    let running = false;
    let timer: number | undefined;

    const setCell = (cell: HTMLElement, ch: string) => {
      cell.dataset.ch = ch;
      cell.querySelectorAll<HTMLElement>('i').forEach((i) => (i.textContent = ch));
    };

    /** one physical flip of a cell to `next` — 2D shutter, cheap to composite */
    const flipOnce = async (cell: HTMLElement, next: string, dur: number) => {
      const current = cell.dataset.ch ?? ' ';
      const topI = cell.querySelector<HTMLElement>('.half.top i')!;
      const bottomI = cell.querySelector<HTMLElement>('.half.bottom i')!;
      const fold = cell.querySelector<HTMLElement>('.fold')!;
      const rise = cell.querySelector<HTMLElement>('.rise')!;
      const foldI = fold.querySelector<HTMLElement>('i')!;
      const riseI = rise.querySelector<HTMLElement>('i')!;

      topI.textContent = next;      // revealed as the fold collapses
      foldI.textContent = current;  // the piece folding away
      riseI.textContent = next;     // the piece dropping in

      const settle = () => {
        bottomI.textContent = next;
        foldI.textContent = next;
        fold.style.transform = 'scaleY(1)';
        rise.style.transform = 'scaleY(0)';
        cell.dataset.ch = next;
      };

      try {
        const a1 = fold.animate(
          [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }],
          { duration: dur * 0.48, easing: 'cubic-bezier(0.6, 0, 0.85, 0.4)', fill: 'forwards' }
        );
        await a1.finished;
        const a2 = rise.animate(
          [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
          { duration: dur * 0.52, easing: 'cubic-bezier(0.15, 0.6, 0.3, 1.12)', fill: 'forwards' }
        );
        await a2.finished;
        a1.cancel();
        a2.cancel();
      } catch {
        /* animation cancelled (nav away, hidden) — settle anyway */
      }
      settle();
    };

    /** spin a cell through 0–2 intermediate characters, then the target */
    const spinTo = async (cell: HTMLElement, target: string) => {
      if (cell.dataset.busy) return;   // never interleave chains on one cell
      const current = cell.dataset.ch ?? ' ';
      if (current === target) return;
      cell.dataset.busy = '1';
      try {
        // most cells go straight to the target; some spin through one filler
        if (Math.random() < 0.45) {
          const filler = FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)]!;
          if (filler !== cell.dataset.ch && filler !== target) {
            await flipOnce(cell, filler, 115 + Math.random() * 30);
          }
        }
        await flipOnce(cell, target, 175);
      } finally {
        delete cell.dataset.busy;
      }
    };

    const showWord = (word: string) => {
      const target = pad(word);
      if (reducedMotion()) {
        cells.forEach((cell, i) => setCell(cell, target[i]!));
        return;
      }
      cells.forEach((cell, i) => {
        window.setTimeout(() => void spinTo(cell, target[i]!), i * 46);
      });
    };

    const tick = () => {
      if (!board.isConnected) return stop();
      wordIdx = (wordIdx + 1) % words.length;
      showWord(words[wordIdx]!);
    };

    const start = () => {
      if (running) return;
      running = true;
      timer = window.setInterval(tick, interval);
    };
    const stop = () => {
      running = false;
      if (timer) window.clearInterval(timer);
    };

    // start immediately if on screen; the observer handles pause/resume
    const vh = viewportH();
    const r = board.getBoundingClientRect();
    if (!vh || (r.top < vh && r.bottom > 0)) start();
    const io = new IntersectionObserver(
      ([e]) => (e && e.isIntersecting ? start() : stop()),
      { threshold: 0.2 }
    );
    io.observe(board);
    const onVis = () => (document.hidden ? stop() : undefined);
    document.addEventListener('visibilitychange', onVis);
    onCleanup(() => {
      stop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    });
  });
}

/* ---- reveal choreography ------------------------------------------------ */
function initReveals() {
  const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal], .lines')];
  if (!targets.length) return;

  // anything already in view reveals immediately (no IO dependency),
  // so above-the-fold content never waits on observer timing
  const vh = viewportH();
  if (!vh) {
    // can't measure the viewport — show everything rather than hide forever
    targets.forEach((t) => t.classList.add('is-in'));
    return;
  }
  const below: HTMLElement[] = [];
  for (const t of targets) {
    const r = t.getBoundingClientRect();
    if (r.top < vh * 0.94 && r.bottom > 0) t.classList.add('is-in');
    else below.push(t);
  }
  if (!below.length) return;

  if (!('IntersectionObserver' in window)) {
    below.forEach((t) => t.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.18, rootMargin: '0px 0px -6% 0px' }
  );
  below.forEach((t) => io.observe(t));
  onCleanup(() => io.disconnect());
}

/* ---- nav: solid state on scroll + menu ---------------------------------- */
function initNav() {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('is-solid', window.scrollY > 28);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  onCleanup(() => window.removeEventListener('scroll', onScroll));

  const btn = nav.querySelector<HTMLButtonElement>('[data-menu-btn]');
  const menu = nav.querySelector<HTMLElement>('[data-menu]');
  if (!btn || !menu) return;

  const setOpen = (open: boolean) => {
    nav.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) menu.hidden = false;
    else window.setTimeout(() => (menu.hidden = true), 500);
  };
  const toggle = () => setOpen(!nav.classList.contains('menu-open'));
  btn.addEventListener('click', toggle);
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && nav.classList.contains('menu-open')) setOpen(false);
  };
  document.addEventListener('keydown', onKey);
  onCleanup(() => {
    document.removeEventListener('keydown', onKey);
    document.documentElement.style.overflow = '';
  });
}

/* ---- footer clock -------------------------------------------------------- */
function initClock() {
  const els = document.querySelectorAll<HTMLElement>('[data-clock]');
  if (!els.length) return;
  const set = () => {
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    els.forEach((el) => (el.textContent = t));
  };
  set();
  const t = window.setInterval(set, 20_000);
  onCleanup(() => window.clearInterval(t));
}

/* ---- lifecycle ----------------------------------------------------------- */
function initAll() {
  initFlaps();
  initReveals();
  initNav();
  initClock();
}

document.addEventListener('astro:page-load', initAll);
document.addEventListener('astro:before-swap', () => {
  cleanups.forEach((fn) => fn());
  cleanups = [];
});
