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

  // ---------- Work With Us button: matches the page's current color mode ----------
  const wwuBtn = document.querySelector('.hero-wwu-btn');
  if (wwuBtn) {
    const theme = document.documentElement.getAttribute('data-theme');
    const accentByTheme = { blue: 'var(--blue)', orange: 'var(--orange)', red: 'var(--red)' };
    const glowRgbByTheme = { blue: '111,163,199', orange: '232,168,87', red: '225,92,86' };
    wwuBtn.style.background = accentByTheme[theme] || 'var(--orange)';
    const glowRgb = glowRgbByTheme[theme] || glowRgbByTheme.orange;
    wwuBtn.style.boxShadow = `0 0 26px rgba(${glowRgb}, 0.55), 0 0 54px rgba(${glowRgb}, 0.28)`;
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
      ['Producer', f.producer],
      ['Cinematographer', f.dp],
      ['Starring', Array.isArray(f.starring) ? f.starring.join(', ') : f.starring],
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

    // Awards — accepts either a string or an array in films-data.js
    modalAwards.innerHTML = '';
    const awardsList = Array.isArray(f.awards) ? f.awards : (f.awards ? [f.awards] : []);
    if (awardsList.length) {
      const h = document.createElement('h4');
      h.className = 'film-modal-awards-label';
      h.textContent = 'Awards';
      modalAwards.appendChild(h);
      const ul = document.createElement('ul');
      awardsList.forEach(a => {
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
    const captionEl = document.querySelector('.editorial-split-text p');

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'cine-dot';
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll('.cine-dot');

    function applyCaption() {
      if (!captionEl) return;
      const newText = slides[index].dataset.caption || '';
      captionEl.classList.add('fading');
      setTimeout(() => {
        captionEl.textContent = newText;
        captionEl.classList.remove('fading');
      }, 300);
    }

    function render() {
      slides.forEach((s, i) => s.classList.toggle('active', i === index));
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }
    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
      applyCaption();
    }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));
    render();
    if (captionEl) captionEl.textContent = slides[index].dataset.caption || '';
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

  // ================================================================
  // ABOUT PAGE: team members drive the site's color mode + saturation.
  // Desktop (real hover): mouseenter/mouseleave per member.
  // Touch/no-hover: whichever card is closest to viewport center wins,
  // recalculated on scroll.
  // ================================================================
  const teamMembers = document.querySelectorAll('.team-member[data-member-theme]');
  if (teamMembers.length) {
    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function setActiveMember(member) {
      teamMembers.forEach(m => m.classList.toggle('active-member', m === member));
      if (member) {
        document.documentElement.setAttribute('data-theme', member.dataset.memberTheme);
      }
      // On mouse-leave (member === null), the color mode is intentionally
      // left as-is — it stays on whichever person was last hovered.
    }

    if (supportsHover) {
      teamMembers.forEach(member => {
        member.addEventListener('mouseenter', () => setActiveMember(member));
        member.addEventListener('mouseleave', () => setActiveMember(null));
      });
    } else {
      let ticking = false;
      function updateClosestToCenter() {
        const viewportCenter = window.innerHeight / 2;
        let closest = null;
        let closestDist = Infinity;
        teamMembers.forEach(member => {
          const rect = member.getBoundingClientRect();
          const memberCenter = rect.top + rect.height / 2;
          const dist = Math.abs(memberCenter - viewportCenter);
          if (dist < closestDist) {
            closestDist = dist;
            closest = member;
          }
        });
        setActiveMember(closest);
        ticking = false;
      }
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateClosestToCenter);
          ticking = true;
        }
      });
      updateClosestToCenter();
    }
  }

});
