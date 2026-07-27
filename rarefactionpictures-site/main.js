document.addEventListener('DOMContentLoaded', () => {

  // ---------- Mobile nav toggle ----------
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.textContent = nav.classList.contains('open') ? '✕' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.textContent = '☰';
      });
    });
  }

  // ---------- Footer year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Work With Us button: random accent color each load ----------
  const wwuBtn = document.querySelector('.hero-wwu-btn');
  if (wwuBtn) {
    const accents = ['var(--blue)', 'var(--orange)', 'var(--red)'];
    wwuBtn.style.background = accents[Math.floor(Math.random() * accents.length)];
  }

  // ================================================================
  // FILM MODAL — shared by every data-film work-card
  // ================================================================
  const backdrop = document.getElementById('filmModalBackdrop');
  const modalTitle = document.getElementById('filmModalTitle');
  const modalMeta = document.getElementById('filmModalMeta');
  const modalFacts = document.getElementById('filmModalFacts');
  const modalAwards = document.getElementById('filmModalAwards');
  const modalVideo = document.getElementById('filmModalVideoEl');
  const modalVideoPlaceholder = document.getElementById('filmModalVideoPlaceholder');
  const modalClose = document.getElementById('filmModalClose');

  function openFilmModal(filmKey) {
    if (typeof FILMS === 'undefined' || !FILMS[filmKey] || !backdrop) return;
    const f = FILMS[filmKey];

    modalTitle.textContent = f.title || '';
    modalMeta.textContent = [f.type, f.year, f.runtime].filter(Boolean).join(' · ');

    // Video vs. placeholder
    if (f.trailerSrc) {
      modalVideo.src = f.trailerSrc;
      if (f.poster) modalVideo.poster = f.poster;
      modalVideo.style.display = 'block';
      modalVideoPlaceholder.style.display = 'none';
    } else {
      modalVideo.removeAttribute('src');
      modalVideo.style.display = 'none';
      modalVideoPlaceholder.style.display = 'flex';
    }

    // Facts list — only render fields that have content
    modalFacts.innerHTML = '';
    const factRows = [
      ['Director', f.director],
      ['Cinematographer', f.dp],
      ['Cast', Array.isArray(f.cast) ? f.cast.join(', ') : f.cast],
      ['Licensing', f.licensing],
      ['Where to Watch', f.whereToWatch]
    ];
    factRows.forEach(([label, value]) => {
      if (value) {
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = value;
        modalFacts.appendChild(dt);
        modalFacts.appendChild(dd);
      }
    });

    // Awards
    modalAwards.innerHTML = '';
    if (f.awards && f.awards.length) {
      const h = document.createElement('h4');
      h.className = 'film-modal-awards-label';
      h.textContent = 'Awards';
      modalAwards.appendChild(h);
      const ul = document.createElement('ul');
      f.awards.forEach(a => {
        const li = document.createElement('li');
        li.textContent = a;
        ul.appendChild(li);
      });
      modalAwards.appendChild(ul);
    }

    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeFilmModal() {
    if (!backdrop) return;
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();
  }

  if (backdrop) {
    modalClose.addEventListener('click', closeFilmModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeFilmModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('open')) closeFilmModal();
    });
  }

  // ---------- Work card click/keyboard handling ----------
  document.querySelectorAll('.work-card[data-film], .work-card[data-youtube]').forEach(card => {
    const activate = () => {
      if (card.dataset.film) {
        openFilmModal(card.dataset.film);
      } else if (card.dataset.youtube) {
        window.open(card.dataset.youtube, '_blank', 'noopener');
      }
    };
    card.style.cursor = 'pointer';
    card.addEventListener('click', activate);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  // ================================================================
  // CINEMATOGRAPHY CAROUSEL (only runs if the markup exists on the page)
  // ================================================================
  const track = document.querySelector('.cine-track');
  const slides = document.querySelectorAll('.cine-slide');
  const prevBtn = document.querySelector('.cine-arrow--prev');
  const nextBtn = document.querySelector('.cine-arrow--next');
  const dotsWrap = document.querySelector('.cine-dots');

  if (track && slides.length) {
    let index = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'cine-dot';
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll('.cine-dot');

    function updateDots() {
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }
    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
      updateDots();
    }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));

    // keep dots in sync if the person swipes/scrolls manually
    let scrollTimeout;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        index = Math.round(track.scrollLeft / track.clientWidth);
        updateDots();
      }, 100);
    });

    updateDots();
  }

  // ================================================================
  // REEL PLAYER — shows placeholder until a real <source> is added
  // ================================================================
  const reelVideo = document.querySelector('.reel-video');
  const reelPlaceholder = document.getElementById('reelPlaceholderLabel');
  const reelMuteBtn = document.querySelector('.reel-mute-toggle');

  if (reelVideo) {
    const hasSource = reelVideo.querySelector('source[src]:not([src=""])');
    if (hasSource) {
      if (reelPlaceholder) reelPlaceholder.style.display = 'none';
      reelVideo.style.display = 'block';
    } else {
      if (reelPlaceholder) reelPlaceholder.style.display = 'flex';
      reelVideo.style.display = 'none';
    }
  }

  if (reelMuteBtn && reelVideo) {
    reelMuteBtn.addEventListener('click', () => {
      reelVideo.muted = !reelVideo.muted;
      reelMuteBtn.textContent = reelVideo.muted ? '🔇' : '🔊';
    });
  }

});
